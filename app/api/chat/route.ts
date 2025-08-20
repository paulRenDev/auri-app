// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_MODELS = ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'];

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is not set in environment variables.' },
      { status: 500 }
    );
  }

  for (const model of FALLBACK_MODELS) {
    const payload = {
      model,
      messages: [
        { role: 'system', content: 'Je bent een behulpzame AI assistent.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    };

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(`❌ Fout bij model "${model}":`, data);
        continue; // probeer volgende model
      }

      const reply = data.choices?.[0]?.message?.content ?? '[Leeg antwoord]';

      return NextResponse.json({ reply, model });
    } catch (error: any) {
      console.error(`❌ Netwerkfout bij model "${model}":`, error);
    }
  }

  return NextResponse.json(
    {
      error: 'Alle modellen faalden. Zie server logs.',
    },
    { status: 500 }
  );
}
