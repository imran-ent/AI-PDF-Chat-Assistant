import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "models/text-embedding-004"


def create_embedding(text: str, task_type="retrieval_document"):

    response = genai.embed_content(
        model=MODEL_NAME,
        content=text,
        task_type=task_type
    )

    return response["embedding"]