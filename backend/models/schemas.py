from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    chunk_count: int
    uploaded_at: datetime


class SourceChunk(BaseModel):
    content: str
    filename: str
    page: Optional[int] = None
    chunk_index: int
    relevance_score: float


class ChatMessage(BaseModel):
    id: str
    role: str  # "user" | "assistant"
    content: str
    sources: Optional[List[SourceChunk]] = None
    timestamp: datetime


class ChatSession(BaseModel):
    id: str
    title: str
    created_at: datetime
    message_count: int


class ChatRequest(BaseModel):
    message: str
    session_id: str
    document_filter: Optional[str] = None  # doc_id to restrict retrieval


class ChatResponse(BaseModel):
    message: ChatMessage
    session_id: str


class AuthRequest(BaseModel):
    password: str


class AuthResponse(BaseModel):
    success: bool
    token: str = ""
