import { NextRequest, NextResponse } from 'next/server';

// Forceer Node.js runtime zodat process.env werkt
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("🕵️ OPENAI_API_KEY prefix:", apiKey?.slice(0, 10));

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key ontbreekt op server (undefined)" },
      { status: 500 }
    );
  }

  const payload = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Je bent een behulpzame assistent." },
      { role: "user", content: message },
    ],
    temperature: 0.7,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("🔴 OpenAI error:", data);
      return NextResponse.json({ error: data }, { status: res.status });
    }

    const reply = data.choices?.[0]?.message?.content ?? "[Geen antwoord]";
    return NextResponse.json({ reply, model: data.model ?? payload.model });
  } catch (err) {
    console.error("🔴 Netwerk/fout bij API-aanroep:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
