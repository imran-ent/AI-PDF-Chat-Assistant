from pathlib import Path
import logging

from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all readable text from a PDF file.

    Args:
        file_path: Path to the PDF file.

    Returns:
        A single string containing all extracted text.

    Raises:
        FileNotFoundError, ValueError for empty/encrypted PDFs
    """
    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")

    if pdf_path.stat().st_size == 0:
        raise ValueError("Uploaded PDF is empty (0 bytes)")

    try:
        reader = PdfReader(str(pdf_path))
    except PdfReadError as e:
        raise ValueError(f"Failed to read PDF (corrupted or invalid): {e}") from e

    if reader.is_encrypted:
        try:
            # try empty password
            reader.decrypt("")
        except Exception:
            raise ValueError("PDF is encrypted and cannot be read. Please upload an unencrypted PDF.") from None

    if not reader.pages:
        raise ValueError("PDF has no pages")

    extracted_text = []
    for idx, page in enumerate(reader.pages):
        try:
            page_text = page.extract_text()
            if page_text and page_text.strip():
                extracted_text.append(page_text.strip())
        except Exception as e:
            logger.warning(f"Failed to extract page {idx+1}: {e}")
            continue

    full_text = "\n".join(extracted_text).strip()

    if not full_text:
        raise ValueError(
            "No extractable text found in PDF. It may be a scanned image. Please upload a text-based PDF."
        )

    if len(full_text) < 20:
        logger.warning(f"Very short extraction ({len(full_text)} chars) from {pdf_path.name}")

    logger.info(f"Extracted {len(full_text)} chars from {pdf_path.name} ({len(reader.pages)} pages)")
    return full_text
