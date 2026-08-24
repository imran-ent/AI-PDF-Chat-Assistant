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
    Store one chunk inside ChromaDB. Handles embedding dimension mismatch
    by clearing stale collection (e.g., after switching from MiniLM 384d to Gemini 768d).
    """
    try:
        embedding = create_embedding(chunk, task_type="retrieval_document")
        col = _get_collection()
        col.add(
            ids=[chunk_id],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[{"page": page, "source": source}],
        )
    except Exception as e:
        err_str = str(e).lower()
        # Detect dimension mismatch: Chroma says "dimension" mismatch
        if "dimension" in err_str and ("expecting" in err_str or "got" in err_str):
            logger.warning(f"Embedding dimension mismatch detected for {chunk_id}: {e}. Clearing collection and retrying...")
            try:
                clear_collection()
                # Recreate embedding and retry once
                embedding = create_embedding(chunk, task_type="retrieval_document")
                col = _get_collection()
                col.add(
                    ids=[chunk_id],
                    documents=[chunk],
                    embeddings=[embedding],
                    metadatas=[{"page": page, "source": source}],
                )
                logger.info(f"Retry succeeded for chunk {chunk_id} after clearing")
                return
            except Exception as retry_e:
                logger.exception(f"Retry failed for chunk {chunk_id}: {retry_e}")
                raise retry_e
        logger.exception(f"Failed to store chunk {chunk_id}: {e}")
        raise


def search_chunks(question: str, top_k: int = 4):
    """
    Retrieve the most relevant chunks.
    """
    try:
        query_embedding = create_embedding(question, task_type="retrieval_query")
        col = _get_collection()
        # If collection empty, return empty result
        if col.count() == 0:
            return {"documents": [[]], "ids": [[]], "metadatas": [[]]}
        # Handle dimension mismatch on query as well
        try:
            results = col.query(query_embeddings=[query_embedding], n_results=min(top_k, col.count()))
        except Exception as qe:
            if "dimension" in str(qe).lower():
                logger.warning(f"Dimension mismatch on query: {qe}. Clearing stale collection.")
                clear_collection()
                return {"documents": [[]], "ids": [[]], "metadatas": [[]]}
            raise
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
