import logging
import os
from typing import List
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Initialize the Gemini API client globally
# It will pull your existing GEMINI_API_KEY from Render's environment variables
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    logger.warning("GEMINI_API_KEY environment variable is missing!")

def create_embedding(text: str) -> List[float]:
    """
    Create embedding for a single text using Google's cloud embedding model.
    Bypasses local memory constraints to prevent Render Free Tier OOM crashes.
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")
        
    try:
        # Use Google's standard lightweight text-embedding model
        # text-embedding-004 creates clean 768-dimensional vector strings
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        
        # Extract the vector coordinates float array
        return response['embedding']
        
    except Exception as e:
        logger.exception(f"Failed to generate Google API embedding: {e}")
        raise RuntimeError(f"Embedding API failed to respond: {e}") from e
