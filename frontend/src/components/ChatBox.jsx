import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRegLightbulb, FaTrash } from "react-icons/fa";
import api from "../services/api";
import Message from "./Message";
import Loader from "./Loader";

const SUGGESTIONS = [
  "Summarize this PDF in 5 bullet points",
  "What are the key takeaways?",
  "List important dates & figures mentioned",
  "Explain this document like I'm 5",
];

function ChatBox({ fileInfo }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // focus input on mount
    inputRef.current?.focus();
  }, []);

  const askQuestion = async (override) => {
    const q = (override ?? question).trim();
    if (!q) return;
    if (q.length < 3) {
      setError("Question too short");
      return;
    }
    setError("");
    setLoading(true);
    // optimistic: keep input disabled but show loader
    try {
      const response = await api.post("/ask", { question: q });
      setMessages((prev) => [
        ...prev,
        {
          question: q,
          answer: response.data.answer,
        },
      ]);
      setQuestion("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      const msg = err.friendlyMessage || "Unable to get AI response. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="flex h-[640px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:h-[720px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">💬</div>
          <div>
            <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">Chat with your PDF</h2>
            <p className="text-xs font-medium text-slate-500">
              {fileInfo ? (
                <>
                  Chatting with <span className="font-bold text-violet-700">{fileInfo.filename}</span> • {fileInfo.chunks} chunks
                </>
              ) : (
                "Ask anything — grounded in your document"
              )}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <FaTrash className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50/40 px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl shadow-lg">✨</div>
            <h3 className="text-base font-extrabold text-slate-900">Start asking questions</h3>
            <p className="mx-auto mt-1 max-w-[32ch] text-sm font-medium text-slate-500">
              Try one of these prompts or type your own. Answers are grounded only in your PDF.
            </p>
            <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => askQuestion(s)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-60"
                >
                  <FaRegLightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="line-clamp-2 leading-tight">{s}</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs font-medium text-slate-400">Tip: Press Enter to send • Shift+Enter for new line</p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message, index) => (
              <Message key={index} question={message.question} answer={message.answer} />
            ))}
            {loading && <Loader />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Loading when no messages but in flight */}
        {loading && messages.length === 0 && (
          <div className="mt-6">
            <Loader />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-slate-200 bg-white p-4">
        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div>
        )}

        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 shadow-inner focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-100">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Ask anything from your PDF..."
            value={question}
            disabled={loading}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setQuestion(e.target.value);
              // auto-grow max 4 lines
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
            }}
            className="max-h-24 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14.5px] font-medium placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={() => askQuestion()}
            disabled={loading || !question.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            <FaPaperPlane className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>AI can make mistakes. Verify important info.</span>
          <span className="hidden sm:inline">RAG • grounded answers only</span>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
