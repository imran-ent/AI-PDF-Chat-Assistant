import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { FaUser } from "react-icons/fa";

function formatText(text) {
  // Simple markdown-ish formatting: **bold**, *italic*, bullet lines
  // Keep it lightweight without extra deps
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // bullet
    if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
      const content = line.replace(/^[-•]\s*/, "");
      return (
        <li key={i} className="ml-4 list-disc">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(content) }} />
        </li>
      );
    }
    if (line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim())) {
      return (
        <li key={i} className="ml-4 list-disc">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
        </li>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
    );
  });
}

function inlineFormat(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px]">$1</code>');
}

function Message({ question, answer }) {
  const [copiedQ, setCopiedQ] = useState(false);
  const [copiedA, setCopiedA] = useState(false);

  const copy = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      // clipboard may be blocked in insecure context
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* User */}
      <div className="flex justify-end">
        <div className="group relative max-w-[82%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 text-white shadow-lg shadow-violet-600/20">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-100">
              <FaUser className="h-3 w-3" /> You
            </span>
            <button
              onClick={() => copy(question, setCopiedQ)}
              className="rounded-full bg-white/15 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-white/25"
              aria-label="Copy question"
            >
              {copiedQ ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
            </button>
          </div>
          <p className="text-[14.5px] leading-relaxed font-medium">{question}</p>
        </div>
      </div>

      {/* AI */}
      <div className="flex justify-start">
        <div className="group max-w-[88%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-violet-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <HiSparkles className="h-3.5 w-3.5" />
              </span>
              AI Assistant
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-violet-700">RAG</span>
            </span>
            <button
              onClick={() => copy(answer, setCopiedA)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 opacity-0 transition group-hover:opacity-100 hover:bg-white"
            >
              {copiedA ? <FiCheck className="h-3 w-3 text-emerald-600" /> : <FiCopy className="h-3 w-3" />}
              {copiedA ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="space-y-1 text-[14.5px] leading-[1.6] text-slate-800">{formatText(answer)}</div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-400">
            <span>✨ Grounded in your PDF</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;
