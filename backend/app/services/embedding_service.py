import logging
import os
from typing import List
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Ensure .env loaded even when cwd is project root (Render runs from src/)
_backend_env = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_backend_env, override=False)
load_dotenv(override=False)

# Lazy client config
_configured = False

def _ensure_gemini():
    global _configured
    if _configured:
        return
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set! Embeddings will fail.")
        return
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        _configured = True
        logger.info("Gemini embedding client configured")
    except Exception as e:
        logger.exception(f"Failed to configure Gemini: {e}")

# Preferred embedding models in priority order (newest -> legacy)
# - text-embedding-004 is current stable (768 dims)
# - gemini-embedding-001 is also valid on v1beta
# - embedding-001 is deprecated (404) - kept as last fallback for debugging
_EMBED_MODELS = [
    "models/text-embedding-004",
    "models/gemini-embedding-001",
    "models/embedding-001",
]

def create_embedding(text: str, task_type: str = "retrieval_document") -> List[float]:
    """
    Create embedding using Google Generative AI.
    Uses text-embedding-004 (768 dims). Falls back gracefully.

    Args:
        text: text to embed
        task_type: retrieval_document | retrieval_query | None
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")

    _ensure_gemini()

    import google.generativeai as genai

    # Truncate very long texts to avoid token limits ( ~ 8000 chars)
    content = text.strip()[:10000]

    last_err = None
    for model_name in _EMBED_MODELS:
        try:
            # task_type is optional; some models require it
            kwargs = {"model": model_name, "content": content}
            # Only add task_type for retrieval models; skip for generic
            if task_type in ("retrieval_document", "retrieval_query", "semantic_similarity"):
                kwargs["task_type"] = task_type

            response = genai.embed_content(**kwargs)

            # Newer SDK returns dict with 'embedding', older may return object
            if isinstance(response, dict):
                emb = response.get("embedding")
                if emb is not None:
                    # Some responses wrap as {'embedding': {'values': [...]}}
                    if isinstance(emb, dict) and "values" in emb:
                        return list(emb["values"])
                    return list(emb)
                # fallback: dict may have 'embedding' -> list directly
                if "embedding" in response:
                    return list(response["embedding"])
            # object response with .embedding attribute
            if hasattr(response, "embedding"):
                emb = response.embedding
                if hasattr(emb, "values"):
                    return list(emb.values)
                return list(emb)
            # last resort: response['embedding'] already handled
            raise RuntimeError(f"Unexpected embedding response format from {model_name}: {type(response)}")

        except Exception as e:
            err_msg = str(e)
            # If model not found, try next fallback immediately
            if "404" in err_msg or "not found" in err_msg.lower() or "NOT_FOUND" in err_msg:
                logger.warning(f"Embedding model {model_name} not available ({err_msg[:120]}), trying fallback...")
                last_err = e
                continue
            # For other errors (quota, auth), don't fallback - surface immediately
            if "API_KEY" in err_msg or "quota" in err_msg.lower() or "permission" in err_msg.lower():
                logger.exception(f"Embedding failed with {model_name}: {e}")
                raise RuntimeError(f"Embedding API failed: {e}") from e
            logger.warning(f"Embedding attempt with {model_name} failed: {e}, trying next...")
            last_err = e
            continue

    # If all models failed
    logger.exception(f"All embedding models failed. Last error: {last_err}")
    raise RuntimeError(f"Embedding API failed to respond: {last_err}") from last_err
