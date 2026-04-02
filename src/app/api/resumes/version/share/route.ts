import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();
    const resumeId = String(body.resumeId || "");
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }
    const token = uuidv4();
    const { error } = await supabase.from("resumes").update({ is_public: true, share_token: token }).eq("id", resumeId);
    if (error) throw error;
    return NextResponse.json({ shareToken: token });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to set share token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

