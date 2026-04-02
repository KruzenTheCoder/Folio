import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

function diffLists(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  const added = [...B].filter((x) => !A.has(x));
  const removed = [...A].filter((x) => !B.has(x));
  return { added, removed };
}

type ResumeLike = { skills?: string[] | string };

function collectSkills(data: ResumeLike): string[] {
  const src = data?.skills;
  const arr = Array.isArray(src) ? src : typeof src === "string" ? src.split(/,|;|\n/).map((s) => s.trim()).filter(Boolean) : [];
  return arr.map((x) => String(x).toLowerCase()).filter(Boolean);
}

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const url = new URL(req.url);
    const fromId = url.searchParams.get("from");
    const toId = url.searchParams.get("to");
    if (!fromId || !toId) {
      return NextResponse.json({ error: "from and to are required" }, { status: 400 });
    }
    const { data: from, error: e1 } = await supabase.from("resume_versions").select("data, html_content").eq("id", fromId).single();
    if (e1) throw e1;
    const { data: to, error: e2 } = await supabase.from("resume_versions").select("data, html_content").eq("id", toId).single();
    if (e2) throw e2;
    const fromSkills = collectSkills(from.data);
    const toSkills = collectSkills(to.data);
    const skills = diffLists(fromSkills, toSkills);
    const htmlChanged = String(from.html_content || "") !== String(to.html_content || "");
    const fieldsChanged: string[] = [];
    const fromData = (from?.data || {}) as Record<string, unknown>;
    const toData = (to?.data || {}) as Record<string, unknown>;
    const keys = new Set([...Object.keys(fromData), ...Object.keys(toData)]);
    for (const k of keys) {
      const fv = fromData[k];
      const tv = toData[k];
      if (JSON.stringify(fv) !== JSON.stringify(tv)) fieldsChanged.push(k);
    }
    return NextResponse.json({ addedSkills: skills.added, removedSkills: skills.removed, htmlChanged, fieldsChanged });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to diff versions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
