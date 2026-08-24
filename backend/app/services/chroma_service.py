import logging
from pathlib import Path
import chromadb

from app.services.embedding_service import create_embedding

logger = logging.getLogger(__name__)

# Resolve absolute path for persistent DB (works both locally and on Render/Railway)
BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
CHROMA_PATH = str(BASE_DIR / "chroma_db")
Path(CHROMA_PATH).mkdir(parents=True, exist_ok=True)

logger.info(f"ChromaDB path: {CHROMA_PATH}")

# Lazy singleton client/collection
_client = None
_collection = None

def _get_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=CHROMA_PATH)
    return _client

def _get_collection():
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(name="pdf_chunks")
    return _collection


def store_chunk(chunk: str, page: int, source: str, chunk_id: str):
    """
    Store one chunk inside ChromaDB.
    """
    try:
        embedding = create_embedding(chunk)
        col = _get_collection()
        col.add(
            ids=[chunk_id],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[{"page": page, "source": source}],
        )
    except Exception as e:
        logger.exception(f"Failed to store chunk {chunk_id}: {e}")
        raise


def search_chunks(question: str, top_k: int = 4):
    """
    Retrieve the most relevant chunks.
    """
    try:
        query_embedding = create_embedding(question)
        col = _get_collection()
        # If collection empty, return empty result
        if col.count() == 0:
            return {"documents": [[]], "ids": [[]], "metadatas": [[]]}
        results = col.query(query_embeddings=[query_embedding], n_results=min(top_k, col.count()))
        return results
    except Exception as e:
        logger.exception(f"search_chunks failed: {e}")
        raise


def clear_collection():
    """Delete all documents in collection (useful when uploading new PDF)."""
    try:
        col = _get_collection()
        ids = col.get().get("ids", [])
        if ids:
            col.delete(ids=ids)
            logger.info(f"Cleared {len(ids)} chunks from collection")
        return len(ids)
    except Exception as e:
        logger.exception(f"clear_collection failed: {e}")
        raise


def get_collection_count() -> int:
    try:
        return _get_collection().count()
    except Exception:
        return 0
