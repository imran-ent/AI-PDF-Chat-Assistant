import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.routes.upload import router as upload_router
from app.routes.chat import router as chat_router

# Load .env from backend folder regardless of cwd (for tests, docker, render)
from pathlib import Path
_backend_env = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_backend_env, override=False)
# also try cwd for flexibility
load_dotenv(override=False)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI PDF Chat Assistant",
    description="Upload PDFs and ask questions using RAG + Gemini",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: allow env-configured frontend urls + localhost for dev
def _parse_origins() -> list[str]:
    env_origins = os.getenv("FRONTEND_URL", "")
    # Default dev + production placeholder
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://ai-pdf-chat-assistant-ashen.vercel.app",
    ]
    if env_origins:
        # support comma-separated list
        extra = [o.strip() for o in env_origins.split(",") if o.strip()]
        # merge unique
        merged = list(dict.fromkeys(default_origins + extra))
        return merged
    return default_origins

origins = _parse_origins()
logger.info(f"CORS allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error. Please try again."})

# Register Routes
app.include_router(upload_router)
app.include_router(chat_router)


@app.get("/", tags=["Health"])
def home():
    return {"message": "AI PDF Chat Assistant Backend Running", "status": "ok", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


@app.get("/config", tags=["Health"])
def config_check():
    # non-sensitive config check for debugging deploy (does not expose key)
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    return {"gemini_configured": has_key, "cors_origins": origins}
