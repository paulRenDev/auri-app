// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message' string" }, { status: 400 });
    }
    // Voor nu: echo terug (hier kan later AI-call komen)
    return NextResponse.json({ reply: `Je zei: ${message}` });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
