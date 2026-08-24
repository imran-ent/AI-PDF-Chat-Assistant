import os
import uuid
import re
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, Query

from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import chunk_text
from app.services.chroma_service import store_chunk, clear_collection, get_collection_count

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Upload"])

# Resolve absolute upload folder
BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "15"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

def _secure_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal."""
    filename = Path(filename).name  # strip dirs
    # replace unsafe chars
    filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    # prevent empty
    if not filename or filename in {".", ".."}:
        filename = f"upload_{uuid.uuid4().hex[:8]}.pdf"
    # ensure .pdf extension
    if not filename.lower().endswith(".pdf"):
        filename += ".pdf"
    # limit length
    if len(filename) > 120:
        ext = ".pdf"
        filename = filename[: 120 - len(ext)] + ext
    return filename


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    clear_existing: bool = Query(default=False, description="Clear previous PDF chunks before uploading"),
):
    # Validate content type and extension
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Some browsers send octet-stream; fallback to filename check
        if not (file.filename and file.filename.lower().endswith(".pdf")):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must have .pdf extension.")

    safe_name = _secure_filename(file.filename)
    # Add short uuid prefix to avoid collisions but keep original name visible
    unique_name = f"{uuid.uuid4().hex[:6]}_{safe_name}"
    file_path = UPLOAD_FOLDER / unique_name

    try:
        # Read with size limit
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB allowed.",
            )

        # Save
        with open(file_path, "wb") as pdf_file:
            pdf_file.write(content)

        logger.info(f"Saved upload: {file_path} ({len(content)} bytes)")

        # Optionally clear previous collection
        if clear_existing:
            cleared = clear_collection()
            logger.info(f"Cleared {cleared} old chunks")

        # Extract text
        try:
            text = extract_text_from_pdf(str(file_path))
        except ValueError as ve:
            # Cleanup saved file on validation failure
            if file_path.exists():
                file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.exception(f"PDF extraction failed: {e}")
            if file_path.exists():
                file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {e}")

        if not text.strip():
            if file_path.exists():
                file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="No text could be extracted from this PDF.")

        # Create chunks
        chunks = chunk_text(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="PDF text could not be chunked (empty or too short).")

        # Store every chunk with metadata
        stored = 0
        for index, chunk in enumerate(chunks):
            try:
                store_chunk(
                    chunk=chunk,
                    page=index + 1,
                    source=safe_name,
                    chunk_id=str(uuid.uuid4()),
                )
                stored += 1
            except Exception as e:
                logger.warning(f"Failed to store chunk {index}: {e}")
                continue

        if stored == 0:
            raise HTTPException(status_code=500, detail="Failed to index PDF chunks. Please try again.")

        return {
            "status": "success",
            "filename": safe_name,
            "stored_filename": unique_name,
            "chunks": stored,
            "total_chunks_generated": len(chunks),
            "collection_total": get_collection_count(),
            "message": f"Successfully indexed {stored} chunks from {safe_name}",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Upload failed: {e}")
        # cleanup on generic error
        if file_path.exists():
            try:
                file_path.unlink(missing_ok=True)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/uploads", tags=["Upload"])
def list_uploads():
    """List uploaded files and collection stats."""
    files = []
    try:
        for p in UPLOAD_FOLDER.glob("*.pdf"):
            files.append({"name": p.name, "size_kb": round(p.stat().st_size / 1024, 1)})
    except Exception:
        pass
    return {"count": len(files), "files": files, "chunks_indexed": get_collection_count()}


@router.delete("/clear", tags=["Upload"])
def clear_all():
    """Clear all indexed chunks and uploaded files (for testing/reset)."""
    try:
        cleared = clear_collection()
        # optionally delete uploaded files
        deleted = 0
        for p in UPLOAD_FOLDER.glob("*.pdf"):
            try:
                p.unlink()
                deleted += 1
            except Exception:
                continue
        return {"status": "cleared", "chunks_cleared": cleared, "files_deleted": deleted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
