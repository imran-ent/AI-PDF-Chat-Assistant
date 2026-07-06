import os
import uuid

from fastapi import APIRouter, File, UploadFile, HTTPException

from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import chunk_text
from app.services.chroma_service import store_chunk


router = APIRouter(tags=["Upload"])


UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    try:

        # Validate PDF
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        # Save uploaded file
        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as pdf_file:
            pdf_file.write(await file.read())

        # Extract text
        text = extract_text_from_pdf(file_path)

        # Create chunks
        chunks = chunk_text(text)

        # Store every chunk
        for index, chunk in enumerate(chunks):

            store_chunk(
                chunk=chunk,
                page=index + 1,
                source=file.filename,
                chunk_id=str(uuid.uuid4())
            )

        return {
            "status": "success",
            "filename": file.filename,
            "chunks": len(chunks)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )