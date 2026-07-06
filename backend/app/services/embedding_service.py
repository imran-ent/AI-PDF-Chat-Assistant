from sentence_transformers import SentenceTransformer


# Load the embedding model only once when the application starts
model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embedding(text: str) -> list:
    """
    Convert text into a vector embedding.

    Args:
        text: Input text.

    Returns:
        Embedding vector as a Python list.
    """

    embedding = model.encode(text)

    return embedding.tolist()