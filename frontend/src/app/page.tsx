"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ScissorsIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

type Chunk = {
  id: number;
  text: string;
};

type Embedding = {
  id: number;
  vector: number[];
};

export default function Home() {
  const [text, setText] = useState("");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: number; text: string; score: number }[]
  >([]);

  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleChunk() {
    setLoading("chunking");
    setError(null);

    try {
      const res = await fetch("/api/v1/chunk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setChunks(data.chunks);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading("");
    }
  }

  async function handleEmbed() {
    setLoading("embedding");
    setError(null);

    try {
      const res = await fetch("/api/v1/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chunks }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setEmbeddings(data.embeddings);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading("");
    }
  }

  function buildRetrievalChunks(
    chunks: { id: number; text: string }[],
    embeddings: { id: number; vector: number[] }[]
  ) {
    return chunks.map((chunk) => {
      const embedding = embeddings.find((emb) => emb.id === chunk.id);

      if (!embedding) {
        throw new Error(`Missing embedding for chunk ${chunk.id}`);
      }

      return {
        id: chunk.id,
        text: chunk.text,
        vector: embedding.vector,
      };
    });
  }

  async function handleRetrieve() {
    setLoading("retrieving");
    setError(null);

    try {
      // 1. Build enriched chunks
      const retrievalChunks = buildRetrievalChunks(chunks, embeddings);

      // 2. Call retrieval endpoint
      const res = await fetch("/api/v1/retrieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          embeddings: retrievalChunks,
          top_k: 3,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading("");
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setAnswer(""); // Reset previous answer

    try {
      const res = await fetch("/api/v1/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          chunks: results, // Sending the retrieved chunks
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();
      setAnswer(data.answer);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RAG Explorer</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Transform documents into searchable mathematical vectors.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Infrastructure (Data Prep) */}
        <div className="lg:col-span-6 space-y-8">
          {/* 1. Raw Input Section */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-semibold flex items-center gap-2 italic">
                <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                1. Knowledge Source
              </h3>
              {text.length > 0 && (
                <span className="text-[10px] text-slate-400">
                  {text.length} chars
                </span>
              )}
            </div>
            <div className="p-6">
              <textarea
                rows={8}
                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-slate-400 font-serif leading-relaxed"
                placeholder="Paste your document content here to begin the RAG process..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                onClick={handleChunk}
                disabled={loading === "chunking" || !text.trim()}
                className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading === "chunking" ? (
                  "Processing..."
                ) : (
                  <>
                    <ScissorsIcon className="w-4 h-4" /> Chunk Document
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 2. Chunk & Embed Visualizer */}
          {chunks.length > 0 && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Chunks Created ({chunks.length})
                </h3>
                <button
                  onClick={handleEmbed}
                  disabled={!!loading}
                  className="text-xs font-bold px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <CpuChipIcon className="w-4 h-4 text-emerald-500" />
                  {loading === "embedding"
                    ? "Calculating..."
                    : "Generate Embeddings"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {chunks.map((c) => {
                  const isEmbedded = embeddings.some((e) => e.id === c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl relative group transition-all hover:border-indigo-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-slate-400">
                          CHUNK_ID: {c.id}
                        </span>
                        {isEmbedded && (
                          <span className="text-[10px] text-emerald-500 font-bold">
                            ● VECTORED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: The AI Brain (Retrieval & Gen) */}
        <div className="lg:col-span-6 space-y-8">
          {/* 3. Vector Search Section */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 sticky top-10 border-t-4 border-t-indigo-500">
            <div className="mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MagnifyingGlassIcon className="w-6 h-6 text-indigo-500" />
                Vector Retrieval
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Search through the embeddings using Cosine Similarity.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask a question about your data..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 rounded-xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:border-indigo-500 outline-none transition-all font-medium"
                />
                <button
                  onClick={handleRetrieve}
                  disabled={!!loading || !query || embeddings.length === 0}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Results Preview */}
              {results.length > 0 && (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Retrieved Context
                    </span>
                    <span className="text-[10px] text-indigo-500 font-bold italic">
                      Sorted by similarity score
                    </span>
                  </div>
                  <div className="space-y-2">
                    {results.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-900/30 rounded-lg flex gap-3 items-start"
                      >
                        <div className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded text-[10px] font-bold">
                          {res.score.toFixed(3)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2">
                          {res.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <hr className="border-slate-100 dark:border-zinc-800 my-6" />

                  {/* 4. Generation Button & Response */}
                  <div className="space-y-4">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2 italic tracking-wide">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                          AI is thinking...
                        </span>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5 text-indigo-200" />{" "}
                          Synthesize Answer
                        </>
                      )}
                    </button>

                    {answer && (
                      <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                          <ChatBubbleLeftRightIcon className="w-12 h-12" />
                        </div>
                        <label className="text-[10px] font-bold uppercase text-indigo-400 block mb-3 tracking-widest">
                          Final Response
                        </label>
                        <p className="text-[15px] leading-relaxed relative z-10 antialiased font-medium">
                          {answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Empty State */}
          {results.length === 0 && (
            <div className="h-40 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-slate-400 text-sm italic p-10 text-center">
              Complete Step 1 & 2 on the left to enable retrieval and
              generation.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
