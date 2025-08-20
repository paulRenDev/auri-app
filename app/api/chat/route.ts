// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not set' },
      { status: 500 }
    );
  }

  const payload = {
    model: 'gpt-4o', // of 'gpt-3.5-turbo'
    messages: [
      { role: 'system', content: 'Je bent een behulpzame assistent.' },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI Error:', errText);
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Er ging iets mis.' }, { status: 500 });
  }
}
