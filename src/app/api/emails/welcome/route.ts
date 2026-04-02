import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const host = process.env.SMTP_HOST!;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER!;
    const pass = process.env.SMTP_PASS!;
    const from = process.env.SMTP_FROM || "no-reply@folio.app";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; color: #1a202c;">
        <h1 style="margin:0 0 8px 0;">Welcome to Folio${name ? `, ${name}` : ""}!</h1>
        <p style="margin:0 0 16px 0;">You're all set to build world-class, ATS-optimized resumes.</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/builder" 
           style="display:inline-block;padding:10px 14px;border-radius:10px;background:#2b6cb0;color:#fff;text-decoration:none;">
          Start Building
        </a>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: "Welcome to Folio",
      html,
    });
    return NextResponse.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
