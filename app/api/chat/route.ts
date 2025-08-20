// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  // Debug: log tijdelijk je API key (alleen lokaal!)
  console.log('🔑 API KEY =', apiKey);

  if (!apiKey) {
    return NextResponse.json(
      { error: '❌ API key niet ingesteld via environment variables' },
      { status: 500 }
    );
  }

  const payload = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Je bent een behulpzame AI assistent.' },
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
      const errorData = await response.json();
      console.error('🛑 OpenAI API fout:', errorData);

      return NextResponse.json(
        { error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '⚠️ Geen antwoord ontvangen.';

    return NextResponse.json({ reply, model: payload.model });
  } catch (err: any) {
    console.error('❌ Fout bij API-aanroep:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
