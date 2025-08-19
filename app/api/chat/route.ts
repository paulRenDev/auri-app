// app/api/chat/route.ts
export const runtime = "nodejs";  // Zorg dat env werkt!

import { NextResponse } from "next/server";


// Modellen uit jouw /api/selftest (Responses = GPT‑5 familie, Chat = 3.5)
const RESPONSES_MODELS = ["gpt-5", "gpt-5-mini", "gpt-5-nano"]; // Responses API
const CHAT_MODELS       = ["gpt-3.5-turbo"];                    // Chat Completions API

const SYSTEM_PROMPT =
  "Je bent Auri, een behulpzame leerbuddy. Antwoord kort, duidelijk en vriendelijk.";

function extractText(json: any): string {
  // Responses API vormen
  if (typeof json?.output_text === "string") return json.output_text;
  const out0 = json?.output?.[0]?.content?.[0];
  if (out0?.type === "output_text" && typeof out0?.text === "string") return out0.text;

  // Chat Completions vorm
  const cc = json?.choices?.[0]?.message?.content;
  if (typeof cc === "string") return cc;

  return "";
}
// voorlopig!!!
console.log("API key?", process.env.OPENAI_API_KEY ? "✅ loaded" : "❌ missing");

async function callResponses(model: string, message: string) {
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`Responses(${model}) → ${await resp.text()}`);
  const data = await resp.json();
  const reply = extractText(data) || "Geen antwoord";
  return { reply, model, endpoint: "responses" as const };
}

async function callChat(model: string, message: string) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`Chat(${model}) → ${await resp.text()}`);
  const data = await resp.json();
  const reply = extractText(data) || "Geen antwoord";
  return { reply, model, endpoint: "chat" as const };
}

function localFallback(message: string) {
  const m = message.toLowerCase();
  if (m.includes("wie ben") || m.includes("who are you"))
    return "Ik ben Auri, je leerbuddy. Waarmee kan ik je helpen? (bv. wiskunde: breuken)";
  if (m.includes("help") || m.includes("kan je"))
    return "Tuurlijk. Geef vak + onderwerp (bv. 'wiskunde: breuken'), ik geef 2 hints en 1 oefenvraag.";
  return "Ik kan de AI even niet bereiken. Geef vak + onderwerp, ik geef 2 hints en 1 oefenvraag.";
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message' string" }, { status: 400 });
    }

    // A) OpenAI Responses API (GPT‑5 familie)
    for (const model of RESPONSES_MODELS) {
      try { return NextResponse.json(await callResponses(model, message)); }
      catch { /* try next */ }
    }

    // B) OpenAI Chat Completions (GPT‑3.5 fallback)
    for (const model of CHAT_MODELS) {
      try { return NextResponse.json(await callChat(model, message)); }
      catch { /* try next */ }
    }

    // C) Altijd een antwoord
    return NextResponse.json({
      reply: `⚠️ Fallback: ${localFallback(message)}`,
      model: "local-fallback",
      endpoint: "local"
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request", detail: String(err) }, { status: 400 });
  }
}
