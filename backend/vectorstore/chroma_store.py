import logging
from typing import List, Dict, Optional

from backend.config import settings
from backend.ingestion.chunker import TextChunk

logger = logging.getLogger(__name__)

_client = None
_collection = None


def _get_client():
    global _client
    if _client is None:
        import chromadb
        from chromadb.config import Settings as ChromaSettings

        _client = chromadb.PersistentClient(
            path=str(settings.CHROMA_DIR),
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def get_collection():
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=settings.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def add_chunks(chunks: List[TextChunk], doc_id: str, embeddings: List[List[float]]):
    collection = get_collection()
    batch_size = 100

    ids = [f"{doc_id}_chunk_{c.chunk_index}" for c in chunks]
    documents = [c.text for c in chunks]
    metadatas = [
        {
            "doc_id": doc_id,
            "filename": c.filename,
            "page": c.page,
            "chunk_index": c.chunk_index,
        }
        for c in chunks
    ]

    for i in range(0, len(ids), batch_size):
        collection.add(
            ids=ids[i : i + batch_size],
            documents=documents[i : i + batch_size],
            embeddings=embeddings[i : i + batch_size],
            metadatas=metadatas[i : i + batch_size],
        )
    logger.info(f"Stored {len(chunks)} chunks for doc {doc_id}")


def query_similar(
    query_embedding: List[float],
    top_k: int = 10,
    doc_filter: Optional[str] = None,
) -> List[Dict]:
    collection = get_collection()
    total = collection.count()
    if total == 0:
        return []

    n_results = min(top_k, total)
    where = {"doc_id": doc_filter} if doc_filter else None

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    items = []
    for chunk_id, doc, meta, dist in zip(
        results["ids"][0],
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        items.append(
            {
                "id": chunk_id,
                "text": doc,
                "metadata": meta,
                "score": float(1.0 - dist),  # cosine distance → similarity
            }
        )
    return items


def delete_document_chunks(doc_id: str):
    collection = get_collection()
    collection.delete(where={"doc_id": doc_id})
    logger.info(f"Deleted all chunks for doc {doc_id}")


def collection_count() -> int:
    try:
        return get_collection().count()
    except Exception:
        return 0
