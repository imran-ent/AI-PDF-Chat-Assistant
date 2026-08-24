# AI PDF Chat Assistant

> Upload any PDF → ask anything → get grounded, cited answers via RAG + Gemini 2.5 Flash

Beautiful, production-ready RAG app: FastAPI + ChromaDB + Sentence-Transformers + Gemini on the backend, React 19 + Vite + Tailwind v4 on the frontend.

![Vite](https://img.shields.io/badge/Frontend-Vite_8-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688) ![Chroma](https://img.shields.io/badge/Vector-ChromaDB-orange)

---

## ✨ Features

- **Dragon, beautiful UI**: glass navbar, gradient hero, drag-&-drop upload, chat bubbles, typing indicator, copy buttons, suggestions
- **RAG pipeline**: PDF → `chunk_text` (1000/200 overlap) → `all-MiniLM-L6-v2` embeddings → ChromaDB → Gemini
- **Grounded answers only**: prompt enforces “answer only from CONTEXT”, cites pages
- **Robust backend**: secure filenames, size limits, encrypted-PDF handling, lazy model loading, absolute paths, health checks, CORS via env
- **Deploy-ready**: Docker, Render, Railway, Vercel configs; env-based URLs; pinned deps

## 🏗️ Architecture

```
User PDF ──► FastAPI /upload ──► PyPDF2 extract ──► chunk_text ──► MiniLM embed ──► ChromaDB
                                                        │
User Q ──► /ask ──► embed Q ──► Chroma search ──► build_prompt ──► Gemini 2.5 Flash ──► Answer
```

## 📦 Project Structure

```
backend/
  app/
    main.py              # FastAPI app, CORS, health
    routes/upload.py     # /upload, /uploads, /clear
    routes/chat.py       # /ask, /status
    services/
      pdf_service.py
      chunk_service.py
      embedding_service.py  # lazy load
      chroma_service.py     # persistent, absolute path
      gemini_service.py     # lazy, fallback model
      prompt_service.py
      chat_service.py
  requirements.txt
  Dockerfile
  .env.example
frontend/
  src/
    components/Navbar.jsx
    components/UploadPDF.jsx  # drag&drop, validation, progress
    components/ChatBox.jsx    # suggestions, auto-grow, clear
    components/Message.jsx    # markdown-ish, copy
    components/Loader.jsx     # typing dots
    services/api.js           # VITE_API_URL
    App.jsx                   # hero + 2-col layout
    index.css                 # tailwind + custom
  vite.config.js
  vercel.json
```

## 🚀 Local Development

### Backend
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # then set GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
# docs at http://localhost:8000/docs
# health at http://localhost:8000/health
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # VITE_API_URL=http://localhost:8000
npm run dev      # http://localhost:5173
npm run build    # production
npm run preview
npm run lint
```

## 🔧 Environment Variables

**backend/.env**
```
GEMINI_API_KEY=...           # required
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173,https://your-frontend.vercel.app
MAX_FILE_SIZE_MB=15
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
# production:
# VITE_API_URL=https://your-backend.onrender.com
```

## 🐳 Docker

```bash
# Backend
cd backend
docker build -t ai-pdf-backend .
docker run -p 8000:8000 --env-file .env ai-pdf-backend

# Frontend (build static then serve via nginx/vercel)
cd frontend
npm run build
# dist/ is ready for Vercel/Netlify
```

## ☁️ Deploy

### Backend → Render / Railway
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env: `GEMINI_API_KEY`, `FRONTEND_URL=https://<vercel-url>`
- Note: `chroma_db/` is ephemeral on free tiers (resets on redeploy). For persistence, attach a disk or use external Chroma.

### Frontend → Vercel
- Root: `frontend/`
- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://<backend-url>`
- `vercel.json` handles SPA fallback + cache.

### CORS
`backend/app/main.py` merges `FRONTEND_URL` (comma-separated) with defaults and logs them. Update env when you redeploy frontend.

## 🧪 API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Status |
| GET | `/health` | Healthy check |
| GET | `/config` | Gemini configured + CORS |
| POST | `/upload` | Multipart `file` (PDF). Query `?clear_existing=false` |
| GET | `/uploads` | List files + chunk count |
| DELETE | `/clear` | Clear all chunks + uploads |
| POST | `/ask` | JSON `{question}` → `{answer}` |
| GET | `/status` | Ready? `{ready, chunks}` |

## 🛡️ Debugging Checklist (what was fixed)

- **Paths**: all file/DB paths now absolute via `Path(__file__).resolve()` — works on Render/Docker
- **Upload**: secure_filename, size limit, encrypted/scan validation, empty-text guard
- **Chunking**: guard `overlap >= chunk_size` (infinite loop)
- **Embeddings**: lazy load to avoid cold-start crash / OOM
- **Gemini**: lazy config, no crash on missing key at import, fallback model, friendly errors
- **Chroma**: empty-collection guard, `min(top_k, count)`, `clear_collection`
- **Prompt**: unified “CONTEXT” template, citation hint
- **CORS**: env-driven, not hardcoded
- **Frontend**: Tailwind properly via `@tailwindcss/vite`, `index.css` imports, `vite.config.js` proxy; `api.js` uses `VITE_API_URL`; no `alert()` UX
- **UI**: full redesign — hero, blobs, glass, drag&drop, progress, stats, suggestions, copy, auto-grow textarea

## 📝 License

MIT — internship project for Colan InfoTech.

---

**Ready to deploy:** set envs, push to GitHub, connect Vercel (frontend) + Render (backend). See sections above.
