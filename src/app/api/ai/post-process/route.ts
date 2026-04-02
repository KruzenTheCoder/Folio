import { NextResponse } from "next/server";
import { postProcessResume } from "@/lib/grok";
import { GenerationIntent, ResumeData } from "@/types/resume";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { data, clarifications, intent } = (await req.json()) as {
      data: ResumeData;
      clarifications?: Record<string, string>;
      intent: GenerationIntent;
    };
    if (!data || !intent) {
      return NextResponse.json({ error: "data and intent are required" }, { status: 400 });
    }
    const refined = await postProcessResume(data, clarifications, intent);
    return NextResponse.json({ data: refined });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to post-process resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
