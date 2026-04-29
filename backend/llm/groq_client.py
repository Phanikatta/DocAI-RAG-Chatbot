"""
LLM backend — uses Anthropic Claude (api.anthropic.com is reachable through Zscaler).
Falls back to extractive summarisation when no API key is configured.
"""
import logging
import ssl
from typing import List, Dict

import httpx as _httpx

# Bypass corporate SSL for Anthropic API
ssl._create_default_https_context = ssl._create_unverified_context
_orig = _httpx.Client.__init__
def _no_verify(self, *a, **kw):
    kw["verify"] = False
    _orig(self, *a, **kw)
_httpx.Client.__init__ = _no_verify

_orig_async = _httpx.AsyncClient.__init__
def _no_verify_async(self, *a, **kw):
    kw["verify"] = False
    _orig_async(self, *a, **kw)
_httpx.AsyncClient.__init__ = _no_verify_async

from backend.config import settings
from backend.models.schemas import SourceChunk

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        import anthropic, os
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if not key:
            return None
        http = _httpx.Client(verify=False)
        _client = anthropic.Anthropic(api_key=key, http_client=http)
    return _client


_SYSTEM = (
    "You are an intelligent document assistant. Answer ONLY from the provided context. "
    "If the context is insufficient, say so clearly. "
    "Cite the source file and page when using a fact. "
    "Use clear markdown formatting for readability. Be concise."
)


def _extractive_answer(query: str, sources: List[SourceChunk]) -> str:
    """Local fallback: return the most relevant chunks formatted as an answer."""
    if not sources:
        return (
            "No relevant information found in the uploaded documents. "
            "Please upload documents related to your query."
        )
    lines = [f"**Based on uploaded documents — top {len(sources)} relevant section(s):**\n"]
    for i, s in enumerate(sources, 1):
        snippet = s.content[:600].strip()
        lines.append(f"---\n**Source {i}: {s.filename} (page {s.page})**\n\n{snippet}\n")
    lines.append(
        "\n> *Note: Add `ANTHROPIC_API_KEY` to `.env` for AI-generated answers.*"
    )
    return "\n".join(lines)


def _build_context(sources: List[SourceChunk]) -> str:
    return "\n\n---\n\n".join(
        f"[Source {i}: {s.filename}, Page {s.page}]\n{s.content}"
        for i, s in enumerate(sources, 1)
    )


def generate_response(query: str, sources: List[SourceChunk], history: List[Dict]) -> str:
    client = _get_client()
    if client is None:
        logger.warning("No ANTHROPIC_API_KEY — using extractive fallback")
        return _extractive_answer(query, sources)

    prior = [{"role": t["role"], "content": t["content"]} for t in history[-6:]]
    context = _build_context(sources)
    user_msg = f"## Context\n\n{context}\n\n---\n\n## Question\n{query}"

    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=settings.MAX_TOKENS,
        system=_SYSTEM,
        messages=[*prior, {"role": "user", "content": user_msg}],
    )
    return resp.content[0].text


def generate_no_context_response(query: str, history: List[Dict]) -> str:
    client = _get_client()
    if client is None:
        return (
            "No relevant documents found. Please upload documents related to your query, "
            "or add `ANTHROPIC_API_KEY` to `.env` for general AI assistance."
        )

    prior = [{"role": t["role"], "content": t["content"]} for t in history[-4:]]
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=(
            "You are a helpful document assistant. "
            "No relevant documents were found. Politely inform the user and suggest uploading relevant documents."
        ),
        messages=[*prior, {"role": "user", "content": query}],
    )
    return resp.content[0].text
