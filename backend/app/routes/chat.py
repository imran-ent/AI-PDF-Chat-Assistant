from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.services.chat_service import chat


router = APIRouter(tags=["Chat"])


class ChatRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_question(request: ChatRequest):

    try:

        answer = chat(request.question)

        return {
            "question": request.question,
            "answer": answer
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )