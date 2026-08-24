import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is loaded from backend folder even when cwd is project root or tests
_backend_env = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_backend_env, override=False)
load_dotenv(override=False)
logger = logging.getLogger(__name__)

_model = None
_configured = False

def _ensure_configured():
    global _model, _configured
    if _configured and _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set. Please configure it in environment variables.")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)

        # Prefer 2.5-flash, fallback to 1.5-flash if not available
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        try:
            _model = genai.GenerativeModel(model_name)
        except Exception:
            logger.warning(f"Model {model_name} not available, falling back to gemini-1.5-flash")
            _model = genai.GenerativeModel("gemini-1.5-flash")

        _configured = True
        logger.info(f"Gemini configured with model: {model_name}")
        return _model
    except ImportError as e:
        raise RuntimeError(f"google-generativeai not installed: {e}") from e
    except Exception as e:
        logger.exception(f"Gemini configuration failed: {e}")
        raise


def ask_gemini(prompt: str) -> str:
    """
    Send prompt to Gemini and return response. Lazy initialization.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    model = _ensure_configured()

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 2048,
            },
        )

        # Handle blocked or empty responses
        if not response or not getattr(response, "text", None):
            # Try to extract via candidates
            try:
                if response.candidates and response.candidates[0].content.parts:
                    return response.candidates[0].content.parts[0].text
            except Exception:
                pass
            raise RuntimeError("Empty response from Gemini (possibly blocked)")

        return response.text.strip()

    except Exception as e:
        logger.exception(f"Gemini Error: {e}")
        # Surface a user-friendly error but keep detail for logs
        raise RuntimeError(f"Gemini Error: {str(e)}") from e
