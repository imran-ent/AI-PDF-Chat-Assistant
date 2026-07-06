from app.services.chroma_service import search_chunks
from app.services.prompt_service import build_prompt
from app.services.gemini_service import ask_gemini


def chat(question: str) -> str:
    """
    Complete RAG Pipeline

    Question
        ↓
    Search ChromaDB
        ↓
    Build Prompt
        ↓
    Gemini
        ↓
    Answer
    """

    # Retrieve relevant chunks
    results = search_chunks(question)

    documents = results.get("documents", [])

    if not documents or not documents[0]:
        return "No relevant information found in the uploaded PDF."

    # Merge retrieved chunks into one context
    context = "\n\n".join(documents[0])

    # Create prompt
    prompt = build_prompt(
        context=context,
        question=question
    )

    # Ask Gemini
    answer = ask_gemini(prompt)

    return answer