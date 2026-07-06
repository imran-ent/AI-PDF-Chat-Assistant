import os

import google.generativeai as genai
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


# Read API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")


# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)


# Load model once
model = genai.GenerativeModel("gemini-2.5-flash")


def ask_gemini(prompt: str) -> str:
    """
    Send prompt to Gemini and return response.
    """

    try:

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:

        raise Exception(f"Gemini Error: {str(e)}")