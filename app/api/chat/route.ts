// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // check input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' string" },
        { status: 400 }
      );
    }

    // call OpenAI API
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // goedkoop en snel
        messages: [
          {
            role: "system",
            content:
              "Je bent Auri, een behulpzame leerbuddy. Antwoord kort, duidelijk en vriendelijk.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json(
        { error: "OpenAI error", detail: err },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Geen antwoord";

    // 👇 extra herkenbare prefix zodat je zeker weet dat deze versie draait
    return NextResponse.json({ reply: `AURI OK → ${reply}` });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request", detail: String(e) },
      { status: 400 }
    );
  }
}
