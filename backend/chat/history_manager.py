import json
import uuid
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict

from backend.config import settings
from backend.models.schemas import ChatMessage, ChatSession, SourceChunk

logger = logging.getLogger(__name__)


def _session_path(session_id: str) -> Path:
    return settings.CHAT_HISTORY_DIR / f"{session_id}.json"


# ── Session CRUD ──────────────────────────────────────────────────────────────

def create_session(title: str = "New Chat") -> ChatSession:
    session_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    data = {"id": session_id, "title": title, "created_at": now, "messages": []}
    _write(session_id, data)
    return ChatSession(id=session_id, title=title, created_at=datetime.now(), message_count=0)


def get_session_raw(session_id: str) -> Optional[Dict]:
    path = _session_path(session_id)
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def list_sessions() -> List[ChatSession]:
    sessions = []
    for path in sorted(
        settings.CHAT_HISTORY_DIR.glob("*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        try:
            with open(path, encoding="utf-8") as f:
                d = json.load(f)
            sessions.append(
                ChatSession(
                    id=d["id"],
                    title=d["title"],
                    created_at=datetime.fromisoformat(d["created_at"]),
                    message_count=len(d["messages"]),
                )
            )
        except Exception as e:
            logger.warning(f"Skipping corrupt session file {path.name}: {e}")
    return sessions


def delete_session(session_id: str) -> bool:
    path = _session_path(session_id)
    if path.exists():
        path.unlink()
        return True
    return False


# ── Message operations ────────────────────────────────────────────────────────

def add_message(
    session_id: str,
    role: str,
    content: str,
    sources: Optional[List[SourceChunk]] = None,
) -> ChatMessage:
    data = get_session_raw(session_id)
    if data is None:
        data = {
            "id": session_id,
            "title": "New Chat",
            "created_at": datetime.now().isoformat(),
            "messages": [],
        }

    now = datetime.now()
    msg = {
        "id": str(uuid.uuid4()),
        "role": role,
        "content": content,
        "timestamp": now.isoformat(),
        "sources": [s.model_dump() for s in sources] if sources else None,
    }
    data["messages"].append(msg)

    # Auto-title from first user message
    if role == "user" and len(data["messages"]) == 1:
        data["title"] = content[:60] + ("…" if len(content) > 60 else "")

    _write(session_id, data)
    return ChatMessage(
        id=msg["id"],
        role=role,
        content=content,
        sources=sources,
        timestamp=now,
    )


def get_session_messages(session_id: str) -> List[ChatMessage]:
    data = get_session_raw(session_id)
    if not data:
        return []

    result = []
    for m in data["messages"]:
        sources = [SourceChunk(**s) for s in m["sources"]] if m.get("sources") else None
        result.append(
            ChatMessage(
                id=m["id"],
                role=m["role"],
                content=m["content"],
                sources=sources,
                timestamp=datetime.fromisoformat(m["timestamp"]),
            )
        )
    return result


def get_llm_history(session_id: str) -> List[Dict]:
    """Return last 10 messages as simple dicts for LLM context."""
    data = get_session_raw(session_id)
    if not data:
        return []
    return [{"role": m["role"], "content": m["content"]} for m in data["messages"][-10:]]


# ── Internal helper ───────────────────────────────────────────────────────────

def _write(session_id: str, data: Dict):
    with open(_session_path(session_id), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
