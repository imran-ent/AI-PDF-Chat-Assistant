from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
from app.routes.chat import router as chat_router


app = FastAPI(
    title="AI PDF Chat Assistant",
    description="Upload PDFs and ask questions using RAG + Gemini",
    version="1.0.0"
)


# Allow React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Routes
app.include_router(upload_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "AI PDF Chat Assistant Backend Running"
    }