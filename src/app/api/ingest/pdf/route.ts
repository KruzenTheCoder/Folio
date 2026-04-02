import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parseResumeContent } from "@/lib/grok";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Extract text from a PDF buffer using pdf-parse v2's PDFParse class.
 */
async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });

  try {
    const result = await parser.getText();
    const text = (result.text || "").trim();

    if (!text) {
      throw new Error(
        "Unable to extract text from PDF. The file may be image-based — please use a text-based PDF."
      );
    }

    return text;
  } finally {
    // Always clean up the parser to free resources
    await parser.destroy().catch(() => {});
  }
}

/**
 * Validate that the buffer starts with the PDF magic bytes (%PDF).
 */
function isPdfBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer.toString("utf-8", 0, 5).startsWith("%PDF")
  );
}

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;

    // ── Case A: Direct PDF body (application/pdf) ──
    if (contentType.startsWith("application/pdf")) {
      const ab = await req.arrayBuffer();
      buffer = Buffer.from(ab);
    }
    // ── Case B: JSON { base64 } ──
    else if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as {
        base64?: string;
      } | null;
      const base64 = body?.base64
        ?.replace(/^data:application\/pdf;base64,/, "")
        .trim();
      if (!base64) {
        return NextResponse.json(
          { error: "Missing base64 field in JSON body" },
          { status: 400 }
        );
      }
      buffer = Buffer.from(base64, "base64");
    }
    // ── Case C: multipart/form-data with file ──
    else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const fileLike =
        form.get("file") || form.get("pdf") || form.get("upload");
      if (!fileLike || !(fileLike instanceof File)) {
        return NextResponse.json(
          {
            error:
              "A PDF file is required (expected field: file, pdf, or upload)",
          },
          { status: 400 }
        );
      }
      const mime = fileLike.type || "application/pdf";
      if (!/application\/pdf/i.test(mime)) {
        return NextResponse.json(
          { error: "Only PDF files are supported" },
          { status: 400 }
        );
      }
      buffer = Buffer.from(await fileLike.arrayBuffer());
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported content-type. Send application/pdf, application/json with { base64 }, or multipart/form-data with a file field.",
        },
        { status: 400 }
      );
    }

    // ── Validate ──
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Empty PDF payload" },
        { status: 400 }
      );
    }
    if (buffer.length > MAX_PDF_SIZE) {
      return NextResponse.json(
        {
          error: `PDF exceeds maximum size of ${MAX_PDF_SIZE / 1024 / 1024}MB`,
        },
        { status: 413 }
      );
    }
    if (!isPdfBuffer(buffer)) {
      return NextResponse.json(
        { error: "The uploaded file does not appear to be a valid PDF" },
        { status: 400 }
      );
    }

    // ── Extract text ──
    const extractedText = await extractTextFromBuffer(buffer);

    // ── Parse with Groq AI ──
    const parsed = await parseResumeContent(extractedText);

    return NextResponse.json({
      extractedText,
      parsed,
      meta: {
        textLength: extractedText.length,
        confidence: parsed.confidence?.overall ?? null,
        industryDetected: parsed.recommendations?.industryDetected ?? null,
      },
    });
  } catch (error) {
    console.error("[ingest/pdf] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
