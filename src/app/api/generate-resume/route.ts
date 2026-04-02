import { NextResponse } from "next/server";
import { generateResumeHtml } from "@/lib/grok";
import { fillMissingFieldsWarning } from "@/lib/resume-validator";
import { GenerationIntent, ResumeData } from "@/types/resume";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body.data as ResumeData;
    const intent = body.intent as GenerationIntent;
    const missingFields = fillMissingFieldsWarning(data);

    if (missingFields.length > 0 && body._forceGenerate !== true) {
      return NextResponse.json({
        status: "incomplete",
        missingFields,
      });
    }

    const html = await generateResumeHtml(intent, data);

    return NextResponse.json({
      status: "complete",
      html,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
