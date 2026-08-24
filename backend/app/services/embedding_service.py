import logging
from typing import List

logger = logging.getLogger(__name__)

_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading embedding model: all-MiniLM-L6-v2")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Embedding model loaded")
        except Exception as e:
            logger.exception(f"Failed to load embedding model: {e}")
            raise RuntimeError(f"Embedding model failed to load: {e}") from e
    return _model


def create_embedding(text: str) -> List[float]:
    """
    Create embedding for a single text. Lazy-loads model on first call.
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")
    model = _get_model()
    # truncate if extremely long to avoid OOM
    truncated = text[:8000]
    embedding = model.encode(truncated, normalize_embeddings=True)
    return embedding.tolist()
