from dataclasses import dataclass
from typing import List, Dict

CHARS_PER_TOKEN = 4  # rough approximation


@dataclass
class TextChunk:
    text: str
    chunk_index: int
    page: int
    filename: str


def _split_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    """
    Recursive character-aware text splitter.
    Tries to break at paragraph → sentence → word boundaries.
    """
    char_size = chunk_size * CHARS_PER_TOKEN
    char_overlap = overlap * CHARS_PER_TOKEN

    if not text or len(text) <= char_size:
        return [text] if text.strip() else []

    separators = ["\n\n", "\n", ". ", "! ", "? ", " ", ""]
    chunks: List[str] = []
    start = 0

    while start < len(text):
        end = min(start + char_size, len(text))

        if end < len(text):
            # Try to find a clean break point
            for sep in separators:
                if not sep:
                    break
                pos = text.rfind(sep, start + char_size // 2, end)
                if pos != -1:
                    end = pos + len(sep)
                    break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        next_start = end - char_overlap
        if next_start <= start:
            next_start = start + 1
        start = next_start

    return chunks


def chunk_pages(
    pages: List[Dict],
    filename: str,
    chunk_size: int = 512,
    overlap: int = 50,
) -> List[TextChunk]:
    all_chunks: List[TextChunk] = []
    chunk_index = 0

    for page_data in pages:
        for chunk_text in _split_text(page_data["text"], chunk_size, overlap):
            all_chunks.append(
                TextChunk(
                    text=chunk_text,
                    chunk_index=chunk_index,
                    page=page_data["page"],
                    filename=filename,
                )
            )
            chunk_index += 1

    return all_chunks
