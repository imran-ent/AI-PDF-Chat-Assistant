# AI PDF Chat Assistant — Frontend

React 19 + Vite 8 + Tailwind v4 + Axios + React Icons

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve dist
npm run lint
```

## Env

```
VITE_API_URL=http://localhost:8000
```

For Vercel: set `VITE_API_URL` to your Render/Railway backend URL.

## Deploy (Vercel)

- Root: `frontend`
- Build: `npm run build`
- Output: `dist`
- SPA fallback via `vercel.json`

## Design

- Glass navbar, gradient hero, drag&drop upload, RAG pipeline card, chat bubbles with copy/markdown, typing indicator
- Fully responsive, dark-text accessible, Tailwind utility-first
