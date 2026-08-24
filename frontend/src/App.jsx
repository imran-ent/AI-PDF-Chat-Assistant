import { useState } from "react";
import Navbar from "./components/Navbar";
import UploadPDF from "./components/UploadPDF";
import ChatBox from "./components/ChatBox";
import { FaCheck, FaBolt, FaShieldAlt, FaSearch } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

function App() {
  const [uploaded, setUploaded] = useState(null); // will hold file info object
  const [status, setStatus] = useState("");

  const fileInfo = uploaded && typeof uploaded === "object" ? uploaded : null;
  const isUploaded = !!uploaded;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-200/40 via-indigo-200/30 to-fuchsia-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-gradient-to-tl from-blue-100/50 to-violet-100/40 blur-3xl" />
      </div>

      <Navbar status={status || (isUploaded ? `Ready • ${fileInfo?.chunks ?? ""} chunks` : "Awaiting PDF")} />

      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10">
        {/* HERO — only show before upload for clean focus after */}
        {!isUploaded && (
          <div className="mb-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold tracking-wide text-violet-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                  <HiSparkles className="h-3 w-3" />
                </span>
                NEW • Gemini 2.5 Flash + RAG
                <span className="h-1 w-1 rounded-full bg-violet-400" />
                <span className="font-semibold text-violet-600">Free to try</span>
              </div>

              <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight text-slate-900 sm:text-5xl">
                Chat with <span className="bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">any PDF</span>
                <br />
                <span className="text-slate-800">in seconds.</span>
              </h1>

              <p className="mt-4 max-w-[52ch] text-[15.5px] font-medium leading-relaxed text-slate-600">
                Upload your research paper, contract, or textbook. We chunk, embed with{" "}
                <span className="font-bold text-slate-900">all-MiniLM-L6-v2</span>, store in{" "}
                <span className="font-bold text-slate-900">ChromaDB</span>, and let{" "}
                <span className="font-bold text-slate-900">Gemini</span> answer — only from your document.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-black"
                >
                  <FaBolt className="h-4 w-4 text-amber-300" /> Try it now — free
                </a>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  <FaCheck className="h-3.5 w-3.5 text-emerald-600" /> No signup needed
                </div>
              </div>

              {/* trust pills */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <FaShieldAlt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Private</div>
                    <div className="text-xs font-medium text-slate-500">Your file stays yours</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <FaSearch className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Cited</div>
                    <div className="text-xs font-medium text-slate-500">Grounded answers only</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FaBolt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Lightning</div>
                    <div className="text-xs font-medium text-slate-500">Seconds to index</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/30">
                <div className="rounded-2xl bg-slate-900 p-4 text-white">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> LIVE RAG PIPELINE
                    <span className="ml-auto rounded bg-white/10 px-2 py-1 text-[10px]">PDF → CHUNKS → EMBED → CHROMA → GEMINI</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="rounded-lg bg-white/10 px-3 py-2">
                      <span className="text-violet-300">→</span> Chunking 12,480 chars → 13 chunks (1000 / 200 overlap)
                    </div>
                    <div className="rounded-lg bg-white/10 px-3 py-2">
                      <span className="text-violet-300">→</span> Embedding with all-MiniLM-L6-v2 • 384-dim
                    </div>
                    <div className="rounded-lg bg-emerald-500/20 px-3 py-2 ring-1 ring-emerald-500/30">
                      <span className="text-emerald-300">✓</span> Stored in ChromaDB • ready for semantic search
                    </div>
                    <div className="mt-3 rounded-xl bg-white p-3 text-slate-900">
                      <div className="text-[11px] font-extrabold tracking-widest text-violet-600">Q: What is the conclusion?</div>
                      <div className="mt-1 text-sm font-medium leading-snug">
                        According to page 3, the study concludes that...
                      </div>
                      <div className="mt-2 text-xs font-bold text-emerald-600">✓ Grounded • page 3 • 0.87 relevance</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  <div className="rounded-xl bg-violet-50 px-2 py-3 text-violet-700">⚡ 2.1s index</div>
                  <div className="rounded-xl bg-blue-50 px-2 py-3 text-blue-700">🎯 0.87 avg score</div>
                  <div className="rounded-xl bg-emerald-50 px-2 py-3 text-emerald-700">✓ 100% grounded</div>
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
                <div className="text-xs font-extrabold tracking-widest text-slate-500">TRUSTED BY</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <span>Researchers</span> <span className="h-1 w-1 rounded-full bg-slate-300" /> <span>Students</span>{" "}
                  <span className="h-1 w-1 rounded-full bg-slate-300" /> <span>Teams</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
          {/* Left column — Upload */}
          <div id="upload" className="lg:sticky lg:top-[88px]">
            <UploadPDF setUploaded={setUploaded} onStatus={setStatus} />

            {/* How it works — hide after upload to save space on mobile, keep on desktop */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold tracking-tight text-slate-900">How it works</h3>
              <ol className="mt-3 space-y-3">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">1</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Upload PDF</div>
                    <div className="text-xs font-medium text-slate-500">We extract text (even 50+ pages) instantly</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">2</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Ask anything</div>
                    <div className="text-xs font-medium text-slate-500">Semantic search finds the exact chunks</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">3</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Get cited answer</div>
                    <div className="text-xs font-medium text-slate-500">Gemini answers only from your PDF</div>
                  </div>
                </li>
              </ol>
              <div className="mt-4 rounded-xl bg-slate-900 px-3 py-2.5 font-mono text-xs text-slate-300">
                <span className="text-violet-400">$</span> curl -X POST /upload -F file=@paper.pdf
              </div>
            </div>
          </div>

          {/* Right column — Chat */}
          <div>
            {isUploaded ? (
              <ChatBox fileInfo={fileInfo} />
            ) : (
              <div className="flex min-h-[540px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white/60 p-8 text-center shadow-sm backdrop-blur">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">🔒</div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">Your chat will appear here</h3>
                <p className="mx-auto mt-2 max-w-[36ch] text-sm font-medium leading-relaxed text-slate-500">
                  Upload a PDF on the left to unlock the chat. Try a textbook, research paper, or contract — it works with any
                  text-based PDF.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">📄 PDF</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">📚 Research papers</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">📑 Contracts</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">🧾 Invoices</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-8 text-center text-sm font-medium text-slate-500">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                <HiSparkles className="h-4 w-4" />
              </span>
              <span className="font-bold text-slate-900">AI PDF Chat Assistant</span>
              <span className="hidden sm:inline">• Built with RAG + Gemini • Ready to deploy</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span>Backend: FastAPI • ChromaDB • Sentence-Transformers</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Frontend: React 19 • Vite • Tailwind v4</span>
            </div>
          </div>
          <p className="mt-4 text-xs">
            Deployed on Vercel (frontend) + Render/Railway (backend). Set <code className="rounded bg-slate-100 px-1 font-mono">VITE_API_URL</code>{" "}
            and <code className="rounded bg-slate-100 px-1 font-mono">GEMINI_API_KEY</code> to go live.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
