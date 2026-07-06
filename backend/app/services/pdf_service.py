from pathlib import Path

from PyPDF2 import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all readable text from a PDF file.

    Args:
        file_path: Path to the PDF file.

    Returns:
        A single string containing all extracted text.
    """

    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")

    reader = PdfReader(pdf_path)

    extracted_text = []

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            extracted_text.append(page_text)

    return "\n".join(extracted_text)