import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const contentType = req.headers.get("content-type") || "";
    let name = "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      name = String(body.name || "").trim();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      name = String(form.get("name") || "").trim();
    } else {
      const body = await req.text();
      try {
        const parsed = JSON.parse(body);
        name = String(parsed.name || "").trim();
      } catch {
        name = "";
      }
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const { error } = await supabase.from("users").update({ name }).eq("id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
