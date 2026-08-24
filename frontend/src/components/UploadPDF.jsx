import { useState, useRef } from "react";
import { FaFilePdf, FaCloudUploadAlt, FaCheckCircle, FaRegFilePdf } from "react-icons/fa";
import { FiX, FiUpload, FiTrash2, FiInfo } from "react-icons/fi";
import api from "../services/api";

function UploadPDF({ setUploaded, onStatus }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const inputRef = useRef(null);

  const MAX_MB = 15;

  const validate = (f) => {
    if (!f) return "No file selected";
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are allowed";
    if (f.size === 0) return "File is empty";
    if (f.size > MAX_MB * 1024 * 1024) return `File too large. Max ${MAX_MB}MB`;
    return null;
  };

  const handleFile = (f) => {
    setError("");
    setSuccess(null);
    const err = validate(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const uploadPDF = async () => {
    if (!file) {
      setError("Choose a PDF first");
      return;
    }
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setProgress("Uploading PDF…");
      onStatus?.("Indexing…");

      // Small artificial step for UX
      await new Promise((r) => setTimeout(r, 300));

      setProgress("Extracting & embedding…");

      const res = await api.post("/upload?clear_existing=false", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      setSuccess(res.data);
      setProgress("Ready to chat!");
      setUploaded(res.data);
      onStatus?.(`Ready • ${res.data.chunks} chunks`);
    } catch (err) {
      const msg = err.friendlyMessage || err.response?.data?.detail || "Upload failed. Try again.";
      setError(msg);
      onStatus?.("Upload failed");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(""), 2000);
    }
  };

  const clear = () => {
    setFile(null);
    setError("");
    setSuccess(null);
    setProgress("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/50">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 opacity-40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-fuchsia-200 to-violet-200 opacity-30 blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
              <FaFilePdf className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">Upload PDF</h2>
              <p className="max-w-[36ch] text-sm leading-snug text-slate-500">Drop your document. We'll chunk, embed & make it chat-ready in seconds.</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
            PDF • max {MAX_MB}MB
          </span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !loading && inputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragOver
              ? "border-violet-400 bg-violet-50/70"
              : file
              ? "border-emerald-200 bg-emerald-50/40"
              : "border-slate-200 bg-slate-50/60 hover:border-violet-300 hover:bg-violet-50/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {!file ? (
            <>
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <FaCloudUploadAlt className="h-7 w-7 text-violet-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                Drop PDF here or <span className="text-violet-600 underline decoration-violet-300 underline-offset-4">browse</span>
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">Text-based PDFs work best (not scanned images)</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">RAG • ChromaDB</span>
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">Embeddings • MiniLM</span>
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">Gemini 2.5 Flash</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full max-w-md items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FaRegFilePdf className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "PDF"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clear();
                  }}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Remove file"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <FaCheckCircle /> Ready to upload
              </p>
            </>
          )}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            <FiInfo className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <FaCheckCircle className="h-4 w-4" /> Indexed successfully
            </div>
            <div className="mt-2 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white px-2 py-2 ring-1 ring-emerald-100">
                <div className="text-[11px] font-bold tracking-widest text-slate-500">CHUNKS</div>
                <div className="text-lg font-extrabold text-slate-900">{success.chunks}</div>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 ring-1 ring-emerald-100">
                <div className="text-[11px] font-bold tracking-widest text-slate-500">TOTAL</div>
                <div className="text-lg font-extrabold text-slate-900">{success.collection_total}</div>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 ring-1 ring-emerald-100">
                <div className="text-[11px] font-bold tracking-widest text-slate-500">FILE</div>
                <div className="truncate text-xs font-bold text-slate-900">{success.filename}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={uploadPDF}
            disabled={!file || loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {progress || "Uploading…"}
              </>
            ) : (
              <>
                <FiUpload className="h-4 w-4" />
                Upload & Index PDF
              </>
            )}
          </button>
          {file && !loading && (
            <button
              onClick={clear}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <FiTrash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <p className="mt-3 text-center text-xs font-medium text-slate-400">
          Your PDF is processed locally + embedded securely. We don’t store file content beyond indexing.
        </p>
      </div>
    </div>
  );
}

export default UploadPDF;
