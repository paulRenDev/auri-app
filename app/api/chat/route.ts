// app/api/chat/route.ts
import { NextResponse } from "next/server";

// 1) Voorkeursmodellen per endpoint
const RESPONSE_MODELS = ["gpt-5", "gpt-5-mini", "gpt-5-nano"];
const CHAT_MODELS = ["gpt-3.5-turbo"];
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

async function callResponses(model: string, message: string) {
  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      // Responses API ondersteunt 'input' met rollen
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

async function callOpenRouter(message: string) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("No OpenRouter key");
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.SITE_URL ?? "https://example.com",
      "X-Title": "Auri Chat",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`OpenRouter → ${await resp.text()}`);
  const data = await resp.json();
  const reply = extractText(data) || "Geen antwoord";
  return { reply, model: data?.model ?? "openrouter/auto", endpoint: "openrouter" as const };
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

    // A) OpenAI Responses API
    for (const model of RESPONSES_MODELS) {
      try { return NextResponse.json(await callResponses(model, message)); }
      catch { /* try next */ }
    }

    // B) OpenAI Chat Completions
    for (const model of CHAT_MODELS) {
      try { return NextResponse.json(await callChat(model, message)); }
      catch { /* try next */ }
    }

    // C) OpenRouter aggregator
    try { return NextResponse.json(await callOpenRouter(message)); }
    catch { /* final fallback */ }

    // D) Altijd een antwoord
    return NextResponse.json({ reply: `⚠️ Fallback: ${localFallback(message)}`, model: "local-fallback", endpoint: "local" });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request", detail: String(err) }, { status: 400 });
  }
}
