import { NextResponse } from "next/server";
import { scoreResumeForAts, deepAtsAnalysis } from "@/lib/ats";
import { ResumeData } from "@/types/resume";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  getAtsCacheKey,
  getCachedAtsResult,
  setCachedAtsResult,
} from "@/lib/ats-jobs";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = body.resume as ResumeData;
    const jobDescription = String(body.jobDescription || "");
    const includeAiAnalysis = body.includeAiAnalysis !== false; // default true

    if (!resume) {
      return NextResponse.json(
        { error: "resume is required" },
        { status: 400 }
      );
    }
    if (!jobDescription.trim()) {
      return NextResponse.json(
        { error: "jobDescription is required for accurate ATS scoring" },
        { status: 400 }
      );
    }

    const cacheKey = getAtsCacheKey(resume, jobDescription);
    const cached = getCachedAtsResult(cacheKey);
    if (cached) {
      return NextResponse.json({ status: "done", cached: true, ...cached });
    }

    const localResult = await scoreResumeForAts(resume, jobDescription, false);
    let aiAnalysis = null;
    if (includeAiAnalysis) {
      try {
        aiAnalysis = await deepAtsAnalysis(resume, jobDescription);
      } catch (err) {
        console.error("[ats/score] AI analysis failed, using local result:", err);
      }
    }

    const finalScore =
      aiAnalysis && typeof aiAnalysis.competitiveScore === "number"
        ? Math.round((localResult.score + aiAnalysis.competitiveScore) / 2)
        : localResult.score;

    const finalResult = {
      ...localResult,
      score: finalScore,
      aiAnalysis,
      source: aiAnalysis ? "ai_blended" : "fallback",
    };
    setCachedAtsResult(cacheKey, finalResult);

    try {
      const supabase = await createSupabaseServer();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("ats_telemetry").insert({
          user_id: session.user.id,
          job_title: localResult.detectedRole || "Unknown",
          industry: localResult.detectedIndustry || "Unknown",
          original_score: localResult.score,
          new_score: finalScore,
          ai_analysis: aiAnalysis || null,
        });
      }
    } catch (telemetryErr) {
      console.error("[ats/score] Failed to log telemetry:", telemetryErr);
    }

    return NextResponse.json({
      status: "done",
      ...finalResult,
    });
  } catch (e) {
    console.error("[ats/score] Error:", e);
    const message = e instanceof Error ? e.message : "Failed to score resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
