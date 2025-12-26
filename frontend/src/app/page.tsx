"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ScissorsIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
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

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight">RAG Laboratory</h1>
        <p className="text-slate-500 dark:text-zinc-400">
          Visualize the journey from raw text to mathematical retrieval.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Input & Processing */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Raw Input */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2 font-semibold">
                <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                <span>Source Text</span>
              </div>
            </div>
            <div className="p-4">
              <textarea
                rows={8}
                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-slate-400"
                placeholder="Paste your long document content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                onClick={handleChunk}
                disabled={!!loading || !text.trim()}
                className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {loading === "chunking" ? (
                  "Processing..."
                ) : (
                  <>
                    <ScissorsIcon className="w-4 h-4" /> Split into Chunks
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Section 2: Chunks Visualizer */}
          {chunks.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-1 rounded">
                    <CheckCircleIcon className="w-4 h-4" />
                  </div>
                  Generated Chunks ({chunks.length})
                </h3>
                <button
                  onClick={handleEmbed}
                  disabled={!!loading}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
                >
                  <CpuChipIcon className="w-4 h-4" /> Generate Embeddings
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {chunks.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm group relative"
                  >
                    <span className="absolute -left-2 top-3 bg-slate-200 dark:bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded font-mono">
                      #{c.id}
                    </span>
                    <p className="pl-4 text-slate-600 dark:text-zinc-400 line-clamp-3 group-hover:line-clamp-none transition-all cursor-default">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Retrieval & Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 3: Search / Retrieve */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MagnifyingGlassIcon className="w-6 h-6 text-indigo-500" />
              Vector Search
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  User Query
                </label>
                <input
                  type="text"
                  placeholder="Ask something about the text..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleRetrieve}
                disabled={!!loading || !query || embeddings.length === 0}
                className="w-full py-3 bg-slate-900 dark:bg-zinc-100 dark:text-black text-white rounded-lg font-bold shadow-lg shadow-indigo-500/10 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Find Nearest Neighbors
              </button>

              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-sm font-semibold mb-4 text-slate-500 uppercase">
                  Results (Top-K)
                </h4>
                {results.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-xl">
                    <p className="text-sm text-slate-400 italic">
                      No search performed yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-full">
                            Score: {res.score.toFixed(4)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{res.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
