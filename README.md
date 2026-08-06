# 🤖 AI PDF Chat Assistant

An intelligent, full-stack conversational AI application that allows users to upload PDF documents and have context-aware, natural language conversations about their content. Powered by Retrieval-Augmented Generation (RAG), this assistant extracts, indexes, and queries document information instantly without requiring manual reading.

---

## 🚀 Features

*   **Multi-PDF Support:** Upload and process single or multiple PDF documents simultaneously.
*   **Context-Aware Chat:** Ask questions and receive precise answers grounded directly in the document text.
*   **Vector Search Engine:** High-speed semantic similarity matching using vector embeddings.
*   **Source Citation:** Highlights exactly which page or section of the PDF the information was drawn from.
*   **Conversation History:** Remembers past turns in the dialogue for seamless, natural follow-up questions.

---

## 🛠️ Tech Stack

*   **Frontend:** [Streamlit](https://streamlit.io) (for a clean, responsive UI)
*   **LLM Orchestration:** [LangChain](https://langchain.com) / LangGraph
*   **AI Model:** OpenAI (GPT-4o) / Anthropic Claude / Google Gemini
*   **Vector Database:** ChromaDB / FAISS / Qdrant
*   **Text Processing:** PyPDF / PDFPlumber (for robust PDF text extraction)

---

## 📋 Architecture Flow

1.  **Ingestion:** User uploads a PDF → Text is extracted and split into semantic chunks.
2.  **Embedding:** Text chunks are converted into vector representations using an embedding model.
3.  **Vector Store:** Chunks are saved to a localized or cloud-based Vector DB for fast search indexing.
4.  **Retrieval & Generation:** User asks a question → System retrieves relevant chunks → LLM synthesizes the final context-backed response.

---

## 🚦 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
*   Python 3.9 or higher
*   An API key from your selected LLM provider (e.g., [OpenAI API Key](https://openai.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd ai-pdf-chat-assistant
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Create a `.env` file in the root directory of the project and add your API keys:

```ini
OPENAI_API_KEY=your_openai_api_key_here
# If using alternative or additional tools:
# PINECONE_API_KEY=your_vector_db_key
```

### Running the Application

Launch the Streamlit web server locally:

```bash
streamlit run app.py
```

The application will open automatically in your browser at `http://localhost:8501`.

---

## 📂 Project Structure

```text
├── .streamlit/          # Streamlit UI theme configurations
├── src/                 # Application source code
│   ├── ingestion.py     # PDF parsing and text chunking logic
│   ├── vector_store.py  # Vector DB indexing and search functions
│   └── llm_chain.py     # LangChain model and prompt definitions
├── app.py               # Main Streamlit user interface application
├── requirements.txt     # List of Python dependencies
├── .env.example         # Example environment configuration template
└── README.md            # Project documentation
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
