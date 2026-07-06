def build_prompt(context: str, question: str) -> str:
    """
    Build the prompt for the LLM using the retrieved context.
    """

    prompt = f"""
You are an AI PDF Assistant.

Answer the user's question ONLY using the information provided in the context.

Rules:
1. Do not use outside knowledge.
2. If the answer is not found in the context, reply:
   "I couldn't find that information in the uploaded PDF."
3. Be clear, accurate, and concise.
4. If possible, answer in bullet points when appropriate.

========================
CONTEXT
========================

{context}

========================
QUESTION
========================

{question}

========================
ANSWER
========================
"""

    return prompt