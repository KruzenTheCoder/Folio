import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    // ── Check test session cookie first ──
    const cookieStore = await cookies();
    const raw = cookieStore.get("folio_session")?.value;
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.loggedIn) {
          return NextResponse.json({
            loggedIn: true,
            user: {
              email: session.email,
              name: session.name,
              plan: "PRO",
            },
          });
        }
      } catch {
        // invalid cookie — fall through to Supabase
      }
    }

    // ── Check Supabase session ──
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ loggedIn: false });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("name, plan")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.full_name || "",
        plan: profile?.plan || "FREE",
      },
    });
  } catch (error) {
    console.error("[auth/session] Error:", error);
    return NextResponse.json({ loggedIn: false });
  }
}
