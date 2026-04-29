"""
Embedding backend — uses sklearn HashingVectorizer so no model download is needed.
Output dim = 384 (same as all-MiniLM-L6-v2) for drop-in compatibility.
HashingVectorizer is deterministic: same text always produces the same vector.
"""
import logging
from typing import List

import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.preprocessing import normalize

from backend.config import settings

logger = logging.getLogger(__name__)

_DIM = 384

_vectorizer = HashingVectorizer(
    n_features=_DIM,
    norm=None,          # we normalise manually below
    alternate_sign=False,
    analyzer="word",
    ngram_range=(1, 2),
    lowercase=True,
    strip_accents="unicode",
)


def _embed(texts: List[str]) -> List[List[float]]:
    matrix = _vectorizer.transform(texts)
    normed = normalize(matrix, norm="l2")
    return normed.toarray().tolist()


def embed_texts(texts: List[str]) -> List[List[float]]:
    logger.info(f"Embedding {len(texts)} chunks (HashingVectorizer, dim={_DIM})")
    return _embed(texts)


def embed_query(query: str) -> List[float]:
    return _embed([query])[0]
