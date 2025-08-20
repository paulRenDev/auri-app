import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: '❌ OPENAI_API_KEY is niet ingesteld op de server' },
        { status: 500 }
      );
    }

    const payload = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Je bent een behulpzame assistent.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    };

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
      console.error('❌ OpenAI API fout:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ reply, model: data.model });
  } catch (error) {
    console.error('❌ Serverfout:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
