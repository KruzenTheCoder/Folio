import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

const TEST_EMAIL = "kruz143000@gmail.com";
const TEST_PASSWORD = "Admin";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ── Test / dev login bypass ──
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      const res = NextResponse.json({
        ok: true,
        user: { email: TEST_EMAIL, name: "Kruz", plan: "PRO" },
      });
      res.cookies.set(
        "folio_session",
        JSON.stringify({ email: TEST_EMAIL, name: "Kruz", loggedIn: true }),
        { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" }
      );
      return res;
    }

    // ── Production Supabase login ──
    const supabase = await createSupabaseServer();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401 }
      );
    }

    let name = data.user?.user_metadata?.full_name || "";
    const { data: profile } = await supabase
      .from("users")
      .select("name, plan")
      .eq("id", data.user.id)
      .single();

    if (profile?.name) {
      name = profile.name;
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        plan: profile?.plan || "FREE",
      },
    });
  } catch (error) {
    console.error("[auth/login] Error:", error);
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
