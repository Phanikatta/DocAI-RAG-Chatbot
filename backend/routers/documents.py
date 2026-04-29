import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.config import settings
from backend.embeddings.embedder import embed_texts
from backend.ingestion.chunker import chunk_pages
from backend.ingestion.parser import parse_document
from backend.models.schemas import DocumentInfo
from backend.vectorstore.chroma_store import add_chunks, delete_document_chunks

router = APIRouter(prefix="/api/documents", tags=["documents"])
logger = logging.getLogger(__name__)

REGISTRY_FILE = settings.DATA_DIR / "documents_registry.json"


def _load_registry() -> dict:
    if REGISTRY_FILE.exists():
        with open(REGISTRY_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_registry(registry: dict):
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, default=str)


@router.post("/upload", response_model=List[DocumentInfo])
async def upload_documents(files: List[UploadFile] = File(...)):
    registry = _load_registry()
    uploaded: List[DocumentInfo] = []

    for file in files:
        name_lower = (file.filename or "").lower()
        if not name_lower.endswith((".pdf", ".docx", ".doc")):
            raise HTTPException(400, f"Unsupported file type: {file.filename}")

        doc_id = str(uuid.uuid4())
        safe_name = file.filename.replace(" ", "_")
        file_path = settings.DOCUMENTS_DIR / f"{doc_id}_{safe_name}"

        content = await file.read()
        if len(content) > 50 * 1024 * 1024:  # 50 MB cap
            raise HTTPException(413, f"{file.filename} exceeds 50 MB limit")

        with open(file_path, "wb") as f:
            f.write(content)

        try:
            logger.info(f"Parsing: {file.filename}")
            pages = parse_document(file_path)
            if not pages:
                file_path.unlink(missing_ok=True)
                raise HTTPException(422, f"No text extracted from {file.filename}")

            chunks = chunk_pages(pages, file.filename, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
            if not chunks:
                file_path.unlink(missing_ok=True)
                raise HTTPException(422, f"Could not chunk {file.filename}")

            logger.info(f"Embedding {len(chunks)} chunks for {file.filename}")
            embeddings = embed_texts([c.text for c in chunks])
            add_chunks(chunks, doc_id, embeddings)

            entry = {
                "id": doc_id,
                "filename": file.filename,
                "file_type": file.filename.rsplit(".", 1)[-1].upper(),
                "size_bytes": len(content),
                "chunk_count": len(chunks),
                "uploaded_at": datetime.now().isoformat(),
                "file_path": str(file_path),
            }
            registry[doc_id] = entry
            _save_registry(registry)

            uploaded.append(
                DocumentInfo(
                    id=doc_id,
                    filename=file.filename,
                    file_type=entry["file_type"],
                    size_bytes=len(content),
                    chunk_count=len(chunks),
                    uploaded_at=datetime.now(),
                )
            )

        except HTTPException:
            raise
        except Exception as exc:
            file_path.unlink(missing_ok=True)
            logger.exception(f"Failed to process {file.filename}")
            raise HTTPException(500, f"Processing failed: {exc}") from exc

    return uploaded


@router.get("/", response_model=List[DocumentInfo])
async def list_documents():
    registry = _load_registry()
    docs = [
        DocumentInfo(
            id=v["id"],
            filename=v["filename"],
            file_type=v["file_type"],
            size_bytes=v["size_bytes"],
            chunk_count=v["chunk_count"],
            uploaded_at=datetime.fromisoformat(v["uploaded_at"]),
        )
        for v in registry.values()
    ]
    return sorted(docs, key=lambda d: d.uploaded_at, reverse=True)


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    registry = _load_registry()
    if doc_id not in registry:
        raise HTTPException(404, "Document not found")

    entry = registry.pop(doc_id)
    _save_registry(registry)

    delete_document_chunks(doc_id)

    fp = Path(entry["file_path"])
    fp.unlink(missing_ok=True)

    return {"success": True, "message": f"Deleted '{entry['filename']}'"}
