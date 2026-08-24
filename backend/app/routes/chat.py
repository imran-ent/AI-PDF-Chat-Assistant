import logging
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, HTTPException

from app.services.chat_service import chat
from app.services.chroma_service import get_collection_count

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Chat"])


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000, description="User question")

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty")
        if len(v) < 3:
            raise ValueError("Question too short")
        return v


class ChatResponse(BaseModel):
    question: str
    answer: str


@router.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    try:
        # Quick check if any PDF indexed
        if get_collection_count() == 0:
            raise HTTPException(
                status_code=400,
                detail="No PDF uploaded yet. Please upload a PDF before asking questions.",
            )

        logger.info(f"Received question: {request.question[:100]}")
        answer = chat(request.question)

        return {"question": request.question, "answer": answer}

    except HTTPException:
        raise
    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        # Gemini or embedding errors
        logger.exception(f"Runtime error in chat: {re}")
        raise HTTPException(status_code=502, detail=str(re))
    except Exception as e:
        logger.exception(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate answer. Please try again.")


@router.get("/status", tags=["Chat"])
def chat_status():
    """Check if chat is ready (has indexed chunks)."""
    count = get_collection_count()
    return {"ready": count > 0, "chunks": count, "message": "Ready" if count > 0 else "Upload a PDF to start chatting"}
