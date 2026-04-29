import logging
from typing import List

from fastapi import APIRouter, HTTPException

from backend.chat.history_manager import (
    add_message,
    create_session,
    delete_session,
    get_llm_history,
    get_session_messages,
    list_sessions,
)
from backend.config import settings
from backend.llm.groq_client import generate_no_context_response, generate_response
from backend.models.schemas import ChatMessage, ChatRequest, ChatResponse, ChatSession
from backend.retrieval.retriever import retrieve

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/message", response_model=ChatResponse)
async def send_message(req: ChatRequest):
    # Persist user turn first
    add_message(req.session_id, "user", req.message)

    # Retrieve relevant document chunks
    sources = retrieve(
        query=req.message,
        top_k=settings.TOP_K,
        doc_filter=req.document_filter,
    )

    # History excludes the message we just added (avoid double-counting)
    history = get_llm_history(req.session_id)[:-1]

    try:
        if sources:
            text = generate_response(req.message, sources, history)
        else:
            text = generate_no_context_response(req.message, history)
            sources = []
    except Exception as exc:
        logger.exception("LLM generation error")
        raise HTTPException(500, f"LLM error: {exc}") from exc

    assistant_msg = add_message(req.session_id, "assistant", text, sources or None)
    return ChatResponse(message=assistant_msg, session_id=req.session_id)


@router.post("/sessions", response_model=ChatSession)
async def new_session():
    return create_session()


@router.get("/sessions", response_model=List[ChatSession])
async def get_sessions():
    return list_sessions()


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def session_messages(session_id: str):
    return get_session_messages(session_id)


@router.delete("/sessions/{session_id}")
async def remove_session(session_id: str):
    if delete_session(session_id):
        return {"success": True}
    raise HTTPException(404, "Session not found")
