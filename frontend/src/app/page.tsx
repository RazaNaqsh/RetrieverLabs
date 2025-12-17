"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);

  async function handleChunk() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function handleEmbed() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main style={{ padding: 20, maxWidth: 800 }}>
        <h1>Stage 1 — Chunking</h1>

        <textarea
          rows={10}
          style={{ width: "100%", marginTop: 10 }}
          placeholder="Paste text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleChunk}
          disabled={loading || !text.trim()}
          style={{ marginTop: 10 }}
          className="border-2 rounded-full p-2"
        >
          {loading ? "Chunking..." : "Chunk Text"}
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>Error: {error}</p>}

        <div style={{ marginTop: 20 }}>
          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <strong>Chunk {chunk.id}</strong>
              <p>{chunk.text}</p>
            </div>
          ))}

          <button
            onClick={handleEmbed}
            disabled={loading || chunks.length === 0}
            style={{ marginLeft: 10 }}
            className="border-2 p-2 rounded-full"
          >
            {loading ? "Embedding..." : "Embed Chunks"}
          </button>
        </div>

        <div style={{ marginTop: 30 }}>
          <h2>Embeddings</h2>

          {embeddings.map((emb) => (
            <div
              key={emb.id}
              style={{
                border: "1px solid #999",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <strong>Chunk {emb.id}</strong>
              <p>Vector length: {emb.vector.length}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
