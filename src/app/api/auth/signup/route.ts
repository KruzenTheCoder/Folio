import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || "",
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    // Create user profile row
    if (data.user) {
      await supabase.from("users").upsert(
        {
          id: data.user.id,
          email: data.user.email,
          name: name || "",
          plan: "FREE",
        },
        { onConflict: "id" }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: name || "",
      },
      // email confirmation may be required depending on Supabase settings
      confirmationRequired: !data.session,
    });
  } catch (error) {
    console.error("[auth/signup] Error:", error);
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
