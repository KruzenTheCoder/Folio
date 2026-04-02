import { NextResponse } from "next/server";
import { getClarifyingQuestions } from "@/lib/grok";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { missingFields, userData } = await req.json();
    const questions = await getClarifyingQuestions(missingFields, userData);

    return NextResponse.json({
      questions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate clarifying questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
