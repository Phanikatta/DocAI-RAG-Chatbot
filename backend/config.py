from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    ADMIN_PASSWORD: str = "admin123"

    # Paths
    DATA_DIR: Path = BASE_DIR / "data"
    DOCUMENTS_DIR: Path = BASE_DIR / "data" / "documents"
    CHROMA_DIR: Path = BASE_DIR / "data" / "chroma_db"
    CHAT_HISTORY_DIR: Path = BASE_DIR / "data" / "chat_history"

    # Embedding
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Chunking — 512 tokens ≈ 2048 chars, 50 token overlap ≈ 200 chars
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50

    # Retrieval
    TOP_K: int = 5

    # ChromaDB
    COLLECTION_NAME: str = "rag_documents"

    # LLM
    GROQ_MODEL: str = "llama3-70b-8192"
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.1

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

# Ensure all data directories exist on import
for _dir in [settings.DOCUMENTS_DIR, settings.CHROMA_DIR, settings.CHAT_HISTORY_DIR]:
    _dir.mkdir(parents=True, exist_ok=True)
