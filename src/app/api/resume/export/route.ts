import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let browser = null;
  try {
    const body = await req.json();
    const html = body.html as string;
    const filename = String(body.filename || "resume").replace(/[^a-zA-Z0-9_-]/g, "_");

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "HTML payload is required" },
        { status: 400 }
      );
    }

    if (html.length > 500_000) {
      return NextResponse.json(
        { error: "HTML payload is too large (max 500KB)" },
        { status: 413 }
      );
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-translate",
        "--disable-sync",
        "--single-process",
      ],
    });

    const page = await browser.newPage();

    // Block unnecessary resources for faster rendering
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      if (["image", "media", "font"].includes(type)) {
        // Allow fonts for proper rendering, block heavy media
        if (type !== "font") {
          request.abort();
          return;
        }
      }
      request.continue();
    });

    // Set content with proper wait strategy
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });

    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts?.ready;
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    await browser.close();
    browser = null;

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[export-pdf] Error:", error);
    const message =
      error instanceof Error ? error.message : "Unable to export PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // already closed
      }
    }
  }
}
