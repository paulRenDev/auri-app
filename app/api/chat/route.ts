// app/api/chat/route.ts
import { NextResponse } from "next/server";

const MODELS = ["gpt-5", "gpt-4.1", "gpt-4.1-mini", "o3-mini"];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' string" },
        { status: 400 }
      );
    }

    let reply = "Geen antwoord";
    let usedModel: string | null = null;
    let lastError: string | null = null;

    for (const model of MODELS) {
      try {
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
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
          lastError = `Model ${model} error: ${await resp.text()}`;
          continue; // probeer volgend model
        }

        const data = await resp.json();
        reply = data?.choices?.[0]?.message?.content ?? "Geen antwoord";
        usedModel = model;
        break; // succes → stop fallback
      } catch (err) {
        lastError = `Model ${model} exception: ${String(err)}`;
        continue;
      }
    }

    if (!usedModel) {
      return NextResponse.json(
        { error: "Alle modellen faalden", detail: lastError },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply, model: usedModel });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", detail: String(err) },
      { status: 400 }
    );
  }
}
