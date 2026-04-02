import { NextResponse } from "next/server";
import { parseResumeContent } from "@/lib/grok";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { rawText } = await req.json();
    if (!rawText) {
      return NextResponse.json({ error: "rawText is required" }, { status: 400 });
    }
    const result = await parseResumeContent(rawText);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
