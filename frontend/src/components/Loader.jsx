function Loader() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
        <span className="text-sm">🤖</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">AI is thinking…</p>
        <p className="text-xs text-slate-500">Searching your PDF for the best answer</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-600 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-600 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-600" />
      </div>
    </div>
  );
}

export default Loader;
