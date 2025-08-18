// app/chat/page.tsx
"use client";
import { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim() || loading) return;
    setChat((prev) => [...prev, "👤 " + message]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setChat((prev) => [...prev, "🤖 " + (data.reply ?? "—")]);
    } catch {
      setChat((prev) => [...prev, "⚠️ Fout bij versturen"]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "ui-sans-serif, system-ui", maxWidth: 720, margin: "0 auto" }}>
      <h1>💬 Auri Chat (MVP)</h1>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, height: 320, overflowY: "auto", margin: "12px 0" }}>
        {chat.length === 0 ? <div style={{ color: "#64748b" }}>Start met een bericht…</div> : chat.map((line, i) => <div key={i} style={{ margin: "6px 0" }}>{line}</div>)}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" ? sendMessage() : null}
          placeholder="Typ je bericht…"
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 6 }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: "10px 14px", borderRadius: 6, background: "#6d28d9", color: "#fff", border: 0 }}>
          {loading ? "…" : "Stuur"}
        </button>
      </div>
    </main>
  );
}
