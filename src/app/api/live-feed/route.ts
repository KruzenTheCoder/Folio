import { createSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ResumeRow {
  id: string;
  title: string;
  created_at: string;
  data: {
    personalInfo?: { fullName?: string };
  } | null;
  template: string | null;
}

function formatEvent(resume: ResumeRow) {
  const name = resume.data?.personalInfo?.fullName || "Anonymous";
  // Use first name only for privacy
  const firstName = name.split(" ")[0];
  return {
    id: resume.id,
    message: `${firstName} created "${resume.title || "a resume"}" — ${new Date(resume.created_at).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}`,
    createdAt: resume.created_at,
    template: resume.template || "modern",
  };
}

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  // Track the latest timestamp we've seen
  let lastSeen = new Date().toISOString();

  const closeStream = (
    controller?: ReadableStreamDefaultController<Uint8Array>
  ) => {
    if (closed) return;
    closed = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (controller) {
      try {
        controller.close();
      } catch {
        // already closed
      }
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      const pushLatest = async () => {
        if (closed) return;
        try {
          const supabase = await createSupabaseServer();

          // Fetch the 5 most recent resumes created since our last check
          const { data: rows, error } = await supabase
            .from("resumes")
            .select("id, title, created_at, data, template")
            .gt("created_at", lastSeen)
            .order("created_at", { ascending: false })
            .limit(5);

          if (error) {
            console.error("[live-feed] Supabase error:", error.message);
            return;
          }

          if (rows && rows.length > 0) {
            lastSeen = rows[0].created_at;
            for (const row of rows.reverse()) {
              const payload = JSON.stringify(formatEvent(row as ResumeRow));
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          } else {
            // Send a heartbeat to keep the connection alive
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }
        } catch (err) {
          console.error("[live-feed] Error:", err);
          // Don't close the stream on transient errors — just skip this tick
        }
      };

      // Immediately push latest resumes on connect,
      // then if no real data exists yet send an initial greeting
      (async () => {
        try {
          const supabase = await createSupabaseServer();
          const { data: recent } = await supabase
            .from("resumes")
            .select("id, title, created_at, data, template")
            .order("created_at", { ascending: false })
            .limit(3);

          if (recent && recent.length > 0) {
            lastSeen = recent[0].created_at;
            for (const row of recent.reverse()) {
              const payload = JSON.stringify(formatEvent(row as ResumeRow));
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          } else {
            // No resumes yet — send a welcome event
            const payload = JSON.stringify({
              id: "welcome",
              message: "Welcome! Resume activity will appear here in real-time.",
              createdAt: new Date().toISOString(),
              template: "modern",
            });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          // ignore initial fetch errors
        }
      })();

      // Poll every 10 seconds for new resumes
      timer = setInterval(pushLatest, 10_000);

      const onAbort = () => closeStream(controller);
      req.signal.addEventListener("abort", onAbort, { once: true });
    },
    cancel() {
      closeStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
