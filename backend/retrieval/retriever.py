from typing import List, Optional

from backend.embeddings.embedder import embed_query
from backend.vectorstore.chroma_store import query_similar
from backend.models.schemas import SourceChunk


def _jaccard(text1: str, text2: str) -> float:
    w1 = set(text1.lower().split())
    w2 = set(text2.lower().split())
    if not w1 or not w2:
        return 0.0
    return len(w1 & w2) / len(w1 | w2)


def _mmr(candidates: list, top_k: int, lambda_mult: float = 0.6) -> list:
    """
    Maximal Marginal Relevance — balances relevance with diversity.
    lambda_mult: 1.0 = pure relevance, 0.0 = pure diversity
    """
    if len(candidates) <= top_k:
        return candidates

    selected = []
    remaining = list(range(len(candidates)))

    # Seed with highest-relevance chunk
    best = max(remaining, key=lambda i: candidates[i]["score"])
    selected.append(best)
    remaining.remove(best)

    while len(selected) < top_k and remaining:
        mmr_scores = []
        for idx in remaining:
            relevance = candidates[idx]["score"]
            redundancy = max(
                _jaccard(candidates[idx]["text"], candidates[s]["text"])
                for s in selected
            )
            mmr_scores.append((idx, lambda_mult * relevance - (1 - lambda_mult) * redundancy))

        best = max(mmr_scores, key=lambda x: x[1])[0]
        selected.append(best)
        remaining.remove(best)

    return [candidates[i] for i in selected]


def retrieve(
    query: str,
    top_k: int = 5,
    doc_filter: Optional[str] = None,
) -> List[SourceChunk]:
    query_emb = embed_query(query)
    # Fetch 2× more than needed so MMR has candidates to choose from
    candidates = query_similar(query_emb, top_k=top_k * 2, doc_filter=doc_filter)

    if not candidates:
        return []

    reranked = _mmr(candidates, top_k=top_k)

    return [
        SourceChunk(
            content=item["text"],
            filename=item["metadata"]["filename"],
            page=item["metadata"].get("page"),
            chunk_index=item["metadata"]["chunk_index"],
            relevance_score=round(item["score"], 4),
        )
        for item in reranked
    ]
