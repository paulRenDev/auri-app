"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string; model?: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${data.error}`, model: "error" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            model: data.model, // hier tonen we welk model is gebruikt
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Netwerkfout: ${String(err)}` },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>💬 Auri Chat (met fallback models)</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 300,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#888" }}>Start met een bericht…</p>
        )}
        {messages.map((m, i) => (
          <p key={i}>
            {m.role === "user" ? "👤" : "🤖"}{" "}
            {m.content}
            {m.role === "assistant" && m.model && m.model !== "error" && (
              <span style={{ fontSize: "0.8em", color: "#666" }}>
                {" "}
                ({m.model})
              </span>
            )}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Typ je bericht..."
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "10px 14px",
            background: "#6d28d9",
            color: "#fff",
            border: 0,
            borderRadius: 6,
          }}
        >
          {loading ? "…" : "Stuur"}
        </button>
      </div>
    </main>
  );
}
