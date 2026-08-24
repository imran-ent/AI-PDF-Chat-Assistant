import { FaBolt, FaGithub } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

function Navbar({ status }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-[64px] max-w-[1180px] items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
            <HiSparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900">AI PDF</span>
              <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[11px] font-bold text-white">CHAT</span>
            </div>
            <p className="hidden text-xs font-medium text-slate-500 sm:block">Ask anything. Get cited answers.</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {status && (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">{status}</span>
            </div>
          )}
          <div className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white sm:flex">
            <FaBolt className="h-3 w-3 text-amber-300" />
            Gemini 2.5 + RAG
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="GitHub"
          >
            <FaGithub className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
