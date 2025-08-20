// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ Geen OpenAI API key gevonden in env vars.");
    return NextResponse.json({ error: 'API key ontbreekt op server' }, { status: 500 });
  }

  const payload = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Je bent een behulpzame assistent.' },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
  };

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("❌ OpenAI fout:", data);
      return NextResponse.json({ error: data }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    const model = data.model || payload.model;

    return NextResponse.json({ reply, model });
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ error: 'Er ging iets mis met de server of netwerk.' }, { status: 500 });
  }
}
