import { NextResponse } from "next/server";
import { generateTemplate, TemplateId } from "@/lib/templates";

type ResumeInput = Parameters<typeof generateTemplate>[0];

function normalizeInput(raw: unknown): ResumeInput {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const personal = (obj.personalInfo && typeof obj.personalInfo === "object" ? obj.personalInfo : {}) as Record<string, unknown>;
  const experienceRaw = Array.isArray(obj.experience) ? obj.experience : [];
  const educationRaw = Array.isArray(obj.education) ? obj.education : [];
  const additional = (obj.additional && typeof obj.additional === "object" ? obj.additional : {}) as Record<string, unknown>;

  return {
    personalInfo: {
      fullName: String(personal.fullName || ""),
      email: String(personal.email || ""),
      phone: String(personal.phone || ""),
      linkedin: personal.linkedin ? String(personal.linkedin) : "",
      portfolio: personal.portfolio ? String(personal.portfolio) : "",
      location: String(personal.location || ""),
    },
    summary: String(obj.summary || ""),
    experience: experienceRaw.map((e) => {
      const row = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
      return {
        jobTitle: String(row.jobTitle || ""),
        company: String(row.company || ""),
        startDate: String(row.startDate || ""),
        endDate: row.endDate ? String(row.endDate) : "",
        isCurrentRole: Boolean(row.isCurrentRole),
        responsibilities: Array.isArray(row.responsibilities)
          ? row.responsibilities.map((v) => String(v)).join("\n")
          : String(row.responsibilities || ""),
      };
    }),
    education: educationRaw.map((e) => {
      const row = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
      return {
        institution: String(row.institution || ""),
        degree: String(row.degree || ""),
        fieldOfStudy: row.fieldOfStudy ? String(row.fieldOfStudy) : "",
        graduationDate: row.graduationDate ? String(row.graduationDate) : "",
        status: row.status ? String(row.status) : "",
      };
    }),
    skills: Array.isArray(obj.skills) ? obj.skills.map((s) => String(s)).join(", ") : String(obj.skills || ""),
    additional: {
      certifications: additional.certifications ? String(additional.certifications) : "",
      projects: additional.projects ? String(additional.projects) : "",
      languages: additional.languages ? String(additional.languages) : "",
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = normalizeInput(body.data);
    const template = (body.template as TemplateId) || "executive-dark";
    const html = generateTemplate(data, template);
    return NextResponse.json({ html });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to render template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

