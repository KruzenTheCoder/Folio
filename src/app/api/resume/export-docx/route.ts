import { NextResponse } from "next/server";
import { ResumeData } from "@/types/resume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = body.resume as ResumeData;
    if (!resume) {
      return NextResponse.json({ error: "resume is required" }, { status: 400 });
    }

    const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
    type ISectionOptions = ConstructorParameters<typeof Document>[0]["sections"][number];

    const sections: ISectionOptions[] = [];

    sections.push({
      properties: {},
      children: [
        new Paragraph({
          text: resume.personalInfo.fullName || "Resume",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun(resume.personalInfo.email || ""),
            new TextRun({ text: "  •  ", break: 0 }),
            new TextRun(resume.personalInfo.phone || ""),
            new TextRun({ text: "  •  ", break: 0 }),
            new TextRun(resume.personalInfo.location || ""),
          ],
        }),
      ],
    });

    if (resume.summary) {
      sections.push({
        properties: {},
        children: [
          new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: resume.summary }),
        ],
      });
    }

    if (resume.experience?.length) {
      const children: InstanceType<typeof Paragraph>[] = [new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 })];
      for (const e of resume.experience) {
        children.push(new Paragraph({ text: `${e.jobTitle} — ${e.company}` }));
        children.push(new Paragraph({ text: `${e.startDate} – ${e.isCurrentRole ? "Present" : e.endDate || ""}` }));
        const bullets = Array.isArray(e.responsibilities)
          ? e.responsibilities
          : (e.responsibilities || "").split("\n").filter(Boolean);
        for (const b of bullets) {
          children.push(
            new Paragraph({
              text: b,
              bullet: { level: 0 },
            }),
          );
        }
      }
      sections.push({ properties: {}, children });
    }

    if (resume.education?.length) {
      const children: InstanceType<typeof Paragraph>[] = [new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 })];
      for (const ed of resume.education) {
        children.push(new Paragraph({ text: `${ed.degree} — ${ed.institution}` }));
        if (ed.graduationDate) children.push(new Paragraph({ text: ed.graduationDate }));
      }
      sections.push({ properties: {}, children });
    }

    const skills = Array.isArray(resume.skills)
      ? resume.skills
      : (resume.skills || "").split(/,|;|\n/).map((s) => s.trim()).filter(Boolean);
    if (skills.length) {
      sections.push({
        properties: {},
        children: [
          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: skills.join(", ") }),
        ],
      });
    }

    const doc = new Document({ sections });
    const buffer = await Packer.toBuffer(doc);
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=resume.docx",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unable to export DOCX";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
