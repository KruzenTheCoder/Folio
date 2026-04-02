import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const url = new URL(req.url);
    const resumeId = url.searchParams.get("resumeId");
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }
    const { data: rows, error } = await supabase
      .from("resume_versions")
      .select("id, version_number, created_at")
      .eq("resume_id", resumeId)
      .order("version_number", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ versions: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list versions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

