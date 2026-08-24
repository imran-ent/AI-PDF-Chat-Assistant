import logging
from app.services.chroma_service import search_chunks, get_collection_count
from app.services.prompt_service import build_prompt
from app.services.gemini_service import ask_gemini

logger = logging.getLogger(__name__)


def chat(question: str) -> str:
    """
    Complete RAG Pipeline:
    Question -> Search ChromaDB -> Build Prompt -> Gemini -> Answer
    """
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    question = question.strip()
    if len(question) < 3:
        raise ValueError("Question too short")

    # Check if any PDF has been uploaded
    if get_collection_count() == 0:
        return "Please upload a PDF first. I need a document to answer from."

    # Retrieve relevant chunks
    results = search_chunks(question)

    documents = results.get("documents", [])

    if not documents or not documents[0]:
        return "I couldn't find that information in the uploaded PDF."

    # Filter out very short/irrelevant chunks and join
    valid_chunks = [d for d in documents[0] if d and len(d.strip()) > 20]
    if not valid_chunks:
        return "I couldn't find that information in the uploaded PDF."

    # Limit context size to avoid token overflow (approx 12000 chars ~ 3000 tokens)
    context = "\n\n".join(valid_chunks)
    if len(context) > 12000:
        logger.warning(f"Context too long ({len(context)}), truncating")
        context = context[:12000]

    # Create prompt
    prompt = build_prompt(context=context, question=question)

    # Ask Gemini
    logger.info(f"Asking Gemini for question: {question[:80]}...")
    answer = ask_gemini(prompt)
    logger.info(f"Gemini answer length: {len(answer)}")

    return answer
