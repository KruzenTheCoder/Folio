import { NextResponse } from "next/server";
import { rewriteSummary } from "@/lib/grok";
import { GenerationIntent } from "@/types/resume";
import { callLLM, ChatMessage } from "@/lib/llm";
import { buildSummaryPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const summary = String(body.summary || "");
    const role = String(body.role || "");
    const industry = String(body.industry || "");
    const tone = (body.tone as GenerationIntent["tone"]) || "professional";
    if (!summary) {
      return NextResponse.json({ error: "summary is required" }, { status: 400 });
    }
    const useLocal = (process.env.AI_PROVIDER || "").toLowerCase() === "local" || process.env.LOCAL_LLM === "true";
    if (useLocal) {
      const prompt = buildSummaryPrompt(
        {
          personalInfo: { fullName: "", email: "", phone: "", linkedin: "", portfolio: "", location: "" },
          summary,
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          customization: {
            template: "modern",
            colorScheme: "modern",
            iconStyle: "standard",
            fontPairing: { heading: "Plus Jakarta Sans", body: "Inter" },
            spacing: 16,
            customCss: "",
          },
        },
        `${role} ${industry}`.trim(),
        tone
      );
      const messages: ChatMessage[] = [
        { role: "system", content: "You are a resume summary assistant. Return only summary text." },
        { role: "user", content: prompt },
      ];
      const text = await callLLM(messages, { maxTokens: 280, temperature: 0.4, asJson: false });
      return NextResponse.json({ summary: String(text || summary).trim() });
    }
    const text = await rewriteSummary(summary, role, industry, tone);
    return NextResponse.json({ summary: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to rewrite summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
