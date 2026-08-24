from typing import List
import logging

logger = logging.getLogger(__name__)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: Full extracted text.
        chunk_size: Maximum characters per chunk.
        overlap: Number of characters shared between chunks.

    Returns:
        List of text chunks.
    """
    if not text or not text.strip():
        return []

    # Guard against invalid params that would cause infinite loop
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0:
        raise ValueError("overlap must be >= 0")
    if overlap >= chunk_size:
        logger.warning(f"overlap ({overlap}) >= chunk_size ({chunk_size}), adjusting to chunk_size-1")
        overlap = chunk_size - 1 if chunk_size > 1 else 0

    chunks: List[str] = []
    start = 0
    text_length = len(text)
    step = chunk_size - overlap

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= text_length:
            break
        start += step

    logger.info(f"Chunked {text_length} chars into {len(chunks)} chunks (size={chunk_size}, overlap={overlap})")
    return chunks
