import { ResumeData, GenerationIntent } from "@/types/resume";
import { KNOWLEDGE, extractKeywords } from "./knowledge";

function ensureString(val: any) {
  if (typeof val === "string") return val;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val ?? "");
  }
}

export function buildOptimizePrompt(
  resume: ResumeData,
  job: string,
  tone: GenerationIntent["tone"] = "professional"
) {
  const keywords = extractKeywords(job);
  const resumeJson = ensureString(resume);
  const jobText = ensureString(job);
  return `
You are an ATS expert and resume optimization engine.

Best Practices:
${KNOWLEDGE.ats}

Examples:
${KNOWLEDGE.examples}

Target Keywords:
${keywords.join(", ")}

Tone:
${tone}

Job Description:
${jobText}

Resume:
${resumeJson}

Task:
Return ONLY a valid JSON object strictly matching this ResumeData schema:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "", "portfolio": "", "location": "" },
  "summary": "",
  "experience": [{ "id": "", "jobTitle": "", "company": "", "startDate": "", "endDate": "", "isCurrentRole": false, "location": "", "responsibilities": [""] }],
  "education": [{ "id": "", "institution": "", "degree": "", "fieldOfStudy": "", "graduationDate": "", "status": "completed" }],
  "skills": ["string"],
  "projects": [{ "id": "", "name": "", "role": "", "startDate": "", "endDate": "", "description": "", "technologies": [""] }],
  "certifications": [{ "id": "", "name": "", "issuer": "", "issueDate": "", "credentialId": "", "credentialUrl": "" }],
  "customization": { "template": "", "colorScheme": "modern", "iconStyle": "standard", "fontPairing": { "heading": "Plus Jakarta Sans", "body": "Inter" }, "spacing": 16, "customCss": "" }
}

Rules:
- Preserve original facts (titles, companies, dates)
- Rewrite bullets with action verbs and metrics
- Weave in target keywords naturally
- Ensure responsibilities is an array of strings
- Do not include explanations
`;
}

export function buildSummaryPrompt(resume: ResumeData, job: string, tone: GenerationIntent["tone"] = "professional") {
  const keywords = extractKeywords(job);
  const resumeJson = ensureString(resume);
  const jobText = ensureString(job);
  return `
You are an ATS expert. Write a 3-4 sentence professional summary.

Best Practices:
${KNOWLEDGE.ats}

Target Keywords:
${keywords.join(", ")}

Job Description:
${jobText}

Resume:
${resumeJson}

Task:
Return only the rewritten summary text suitable for the resume's Summary section. No JSON, no explanation.
`;
}
