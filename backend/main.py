import logging

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.chat.history_manager import list_sessions
from backend.routers import auth, chat, documents
from backend.vectorstore.chroma_store import collection_count, get_collection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)

app = FastAPI(
    title="RAG Chatbot API",
    description="Document Q&A powered by RAG + Groq LLaMA3",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(auth.router)


@app.on_event("startup")
async def _startup():
    get_collection()
    logging.getLogger(__name__).info("ChromaDB collection ready.")


@app.get("/api/health", tags=["health"])
async def health():
    return {
        "status": "healthy",
        "total_chunks": collection_count(),
        "session_count": len(list_sessions()),
    }


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
