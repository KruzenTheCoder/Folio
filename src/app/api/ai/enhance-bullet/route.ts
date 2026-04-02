import { NextResponse } from "next/server";
import { enhanceBullet } from "@/lib/grok";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text, jobTitle, company, industry } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    
    const result = await enhanceBullet({
      text,
      jobTitle: jobTitle || "",
      company: company || "",
      industry: industry || ""
    });
    
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enhance bullet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
