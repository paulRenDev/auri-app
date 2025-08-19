import { NextResponse } from "next/server";

const PREFERRED_MODELS = [
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-3.5-turbo",
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message' string" }, { status: 400 });
    }

    // Probeer eerst onze vaste lijst
    for (const model of PREFERRED_MODELS) {
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
              { role: "system", content: "Je bent Auri, een behulpzame leerbuddy. Antwoord kort en duidelijk." },
              { role: "user", content: message },
            ],
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const reply = data?.choices?.[0]?.message?.content ?? "Geen antwoord";
          return NextResponse.json({ reply, model });
        }
      } catch {
        // probeer volgende model
      }
    }

    // 👉 Als alles faalt → dynamisch ophalen welke modellen er nu bestaan
    const modelsResp = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (modelsResp.ok) {
      const data = await modelsResp.json();
      const available = data.data
        .map((m: any) => m.id)
        .filter((id: string) =>
          id.includes("gpt-")
        );

      if (available.length > 0) {
        const fallbackModel = available[0]; // pak eerste beschikbare model
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages: [
              { role: "system", content: "Je bent Auri, een behulpzame leerbuddy. Antwoord kort en duidelijk." },
              { role: "user", content: message },
            ],
          }),
        });

        if (resp.ok) {
          const replyData = await resp.json();
          const reply = replyData?.choices?.[0]?.message?.content ?? "Geen antwoord";
          return NextResponse.json({ reply, model: fallbackModel });
        }
      }
    }

    return NextResponse.json({ error: "Alle modellen faalden" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
