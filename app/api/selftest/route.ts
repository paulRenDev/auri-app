import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const result: any = { hasOpenAIKey: hasKey };

  try {
    if (!hasKey) throw new Error("OPENAI_API_KEY ontbreekt");
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      cache: "no-store",
    });
    result.modelsStatus = r.status;
    if (!r.ok) {
      result.error = await r.text();
    } else {
      const data = await r.json();
      // toon de 10 meest relevante modellen
      result.sampleModels = data.data
        .map((m: any) => m.id)
        .filter((id: string) => id.includes("gpt-") || id.includes("o"))
        .slice(0, 10);
    }
  } catch (e) {
    result.error = String(e);
  }

  return NextResponse.json(result);
}
