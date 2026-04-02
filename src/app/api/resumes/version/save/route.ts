import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ResumeData, GenerationIntent } from "@/types/resume";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();
    const data = body.data as ResumeData;
    const html = String(body.html || "");
    const title = String(body.title || data?.personalInfo?.fullName || "Resume");
    const intent = (body.intent as GenerationIntent) || null;
    const resumeId = body.resumeId as string | undefined;
    const slug = String(body.slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${uuidv4().slice(0, 8)}`);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let currentResumeId = resumeId;
    if (!currentResumeId) {
      const { data: inserted, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title,
          slug,
          data,
          html_content: html,
          template: "modern",
          intent,
        })
        .select("id, version")
        .single();
      if (error) throw error;
      currentResumeId = inserted.id;
    }

    const { data: resumeRow, error: resumeErr } = await supabase.from("resumes").select("version").eq("id", currentResumeId).single();
    if (resumeErr) throw resumeErr;
    const nextVersion = (resumeRow?.version || 0) + 1;

    const { error: verErr } = await supabase.from("resume_versions").insert({
      resume_id: currentResumeId,
      version_number: nextVersion,
      data,
      html_content: html,
    });
    if (verErr) throw verErr;

    const { error: updErr } = await supabase.from("resumes").update({ version: nextVersion, data, html_content: html, title }).eq("id", currentResumeId);
    if (updErr) throw updErr;

    return NextResponse.json({ resumeId: currentResumeId, version: nextVersion, slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

