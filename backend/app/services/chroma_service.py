import chromadb

from app.services.embedding_service import create_embedding


# Create persistent database
client = chromadb.PersistentClient(path="chroma_db")


# Create collection if it doesn't already exist
collection = client.get_or_create_collection(
    name="pdf_chunks"
)


def store_chunk(
    chunk: str,
    page: int,
    source: str,
    chunk_id: str
):
    """
    Store one chunk inside ChromaDB.
    """

    embedding = create_embedding(
    chunk,
    "retrieval_document"
)

    collection.add(
        ids=[chunk_id],
        documents=[chunk],
        embeddings=[embedding],
        metadatas=[
            {
                "page": page,
                "source": source
            }
        ]
    )


def search_chunks(
    question: str,
    top_k: int = 3
):
    """
    Retrieve the most relevant chunks.
    """

    query_embedding = create_embedding(
    question,
    "retrieval_query"
)

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k
    )

    return results