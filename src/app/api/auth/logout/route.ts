import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST() {
  try {
    // Sign out of Supabase
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut().catch(() => {});

    // Also clear the test session cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set("folio_session", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (error) {
    console.error("[auth/logout] Error:", error);
    return NextResponse.json({ ok: false, error: "Logout failed" }, { status: 500 });
  }
}
