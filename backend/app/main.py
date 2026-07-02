from fastapi import FastAPI
from app.routes.upload import router as upload_router

app = FastAPI(
    title="AI PDF Chat Assistant",
    version="1.0.0"
)

app.include_router(upload_router)

@app.get("/")
def root():
    return {
        "message": "AI PDF Chat Assistant Backend Running"
    }