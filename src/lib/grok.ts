import {
  ClarifyingQuestion,
  GenerationIntent,
  ParseResult,
  ResumeData,
} from "@/types/resume";
import { callLLM, ChatMessage } from "@/lib/llm";

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface IndustryContext {
  industry: string;
  subIndustry?: string;
  keyTerminology: string[];
  essentialSkills: string[];
  preferredCertifications: string[];
  commonMetrics: string[];
  toneGuidance: string;
}

export interface BulletEnhancementOptions {
  text: string;
  jobTitle: string;
  company: string;
  industry: string;
  targetRole?: string;
  targetIndustry?: string;
  includeMetrics?: boolean;
  strengthenImpact?: boolean;
}

export interface MultiStepOptimization {
  step: number;
  title: string;
  changes: string[];
  improvedData: ResumeData;
  reasoning: string;
}

export interface SmartParseOptions {
  autoEnhance?: boolean;
  detectIndustry?: boolean;
  extractMetrics?: boolean;
  inferMissingData?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG & MULTI-MODEL ROUTING
   ═══════════════════════════════════════════════════════════════════════════ */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export type TaskType = "ats_scoring" | "rewriting" | "quick_feedback" | "default";

function getModel(task: TaskType): string {
  const perTaskOverride =
    task === "ats_scoring"
      ? process.env.AI_MODEL_ATS
      : task === "rewriting"
      ? process.env.AI_MODEL_REWRITE
      : task === "quick_feedback"
      ? process.env.AI_MODEL_QUICK
      : process.env.AI_MODEL_DEFAULT;
  if (perTaskOverride) return perTaskOverride;

  if (process.env.GROQ_MODEL) return process.env.GROQ_MODEL;

  switch (task) {
    case "ats_scoring":
      return "llama-3.3-70b-versatile"; 
    case "rewriting":
      return "llama-3.3-70b-versatile";
    case "quick_feedback":
      return "qwen-2.5-32b"; 
    default:
      return "mixtral-8x7b-32768";
  }
}

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  if (!key) {
    throw new Error("Groq API key not configured. Set GROQ_API_KEY in .env.local.");
  }
  return key;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CORE API CALLER (Enhanced with streaming support)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function callGrok(
  systemPrompt: string,
  userPrompt: string,
  asJson = false,
  temperature = 0.3,
  maxTokens = 8000,
  taskType: TaskType = "default"
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `${asJson ? "Output valid JSON.\n\n" : ""}${userPrompt}` }
  ];

  return callLLM(messages, {
    temperature,
    maxTokens,
    asJson,
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAFE JSON PARSER (Enhanced with better recovery)
   ═══════════════════════════════════════════════════════════════════════════ */

function safeJsonParse<T>(text: string, fallback?: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        // Try to fix common JSON issues
        const fixed = jsonMatch[0]
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]")
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Quote keys
        try {
          return JSON.parse(fixed) as T;
        } catch {
          if (fallback) return fallback;
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    }
    if (fallback) return fallback;
    throw new Error("Failed to parse AI response as JSON");
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INDUSTRY INTELLIGENCE ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */

export async function detectIndustryContext(
  resumeData: ResumeData,
  targetRole?: string,
  jobDescription?: string
): Promise<IndustryContext> {
  const prompt = `
You are an expert career analyst specializing in industry classification and professional standards across ALL sectors.

Analyze the following information and determine the industry context with precision:

RESUME DATA:
${JSON.stringify({
  experience: resumeData.experience,
  skills: resumeData.skills,
  education: resumeData.education,
})}

TARGET ROLE: ${targetRole || "Not specified"}
JOB DESCRIPTION: ${jobDescription ? jobDescription.slice(0, 500) : "Not provided"}

Return a JSON object with this exact structure:
{
  "industry": "Primary industry (e.g., Healthcare, Finance, Technology, Education, Retail, Manufacturing, Legal, Marketing, Sales, Construction, etc.)",
  "subIndustry": "More specific classification (e.g., 'Acute Care Nursing', 'Investment Banking', 'SaaS Sales', 'K-12 Education')",
  "keyTerminology": ["20 industry-specific terms, jargon, and phrases commonly used in this field"],
  "essentialSkills": ["10-15 must-have skills for this industry/role"],
  "preferredCertifications": ["Relevant certifications, licenses, or credentials for this industry"],
  "commonMetrics": ["Types of metrics typically used to measure success (e.g., 'patient outcomes', 'revenue growth', 'code coverage', 'student test scores')"],
  "toneGuidance": "The appropriate professional tone for this industry (e.g., 'clinical and precise', 'results-driven and dynamic', 'collaborative and innovative')"
}

IMPORTANT:
- Be specific to the actual industry, not generic
- For healthcare: include terms like "patient care", "clinical protocols", "HIPAA"
- For finance: include "financial modeling", "risk assessment", "compliance"
- For sales: include "quota attainment", "pipeline management", "CRM"
- For education: include "curriculum development", "student outcomes", "differentiated instruction"
- Adjust terminology for the specific role level (entry-level vs. executive)

Return ONLY valid JSON.`;

  try {
    const response = await callGrok(
      "You are an industry classification expert. Return only valid JSON.",
      prompt,
      true,
      0.2
    );
    return safeJsonParse<IndustryContext>(response);
  } catch (error) {
    console.error("[groq] Industry detection failed:", error);
    // Return generic fallback
    return {
      industry: "General",
      keyTerminology: [],
      essentialSkills: [],
      preferredCertifications: [],
      commonMetrics: ["results", "performance", "quality"],
      toneGuidance: "professional and results-oriented",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SMART RESUME PARSER (Industry-Aware)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function parseResumeContent(
  rawText: string,
  options: SmartParseOptions = {}
): Promise<ParseResult> {
  const {
    autoEnhance = true,
    detectIndustry = true,
    extractMetrics = true,
    inferMissingData = true,
  } = options;

  const prompt = `
You are an advanced resume parsing AI with deep understanding of professional formats across ALL industries.

Parse the following resume text with maximum precision and intelligence:

CONTENT:
${rawText}

PARSING INSTRUCTIONS:
1. Extract ALL information with 100% fidelity
2. ${extractMetrics ? "Identify and extract ALL quantifiable metrics (numbers, percentages, dollar amounts, timeframes)" : ""}
3. ${detectIndustry ? "Analyze the content to determine the professional industry and role" : ""}
4. ${inferMissingData ? "Use contextual clues to infer missing but obvious information (e.g., if someone mentions 'managing ICU patients', infer healthcare industry)" : ""}
5. Break down bullet points individually - DO NOT combine them into paragraphs
6. Preserve exact wording but normalize formatting (dates, phone numbers, etc.)
7. For current roles, detect phrases like "Present", "Current", "Now" and set isCurrentRole: true

Return a JSON object with this exact structure:
{
  "extractedData": {
    "personalInfo": { 
      "fullName": "", 
      "email": "", 
      "phone": "", 
      "linkedin": "", 
      "portfolio": "", 
      "location": "" 
    },
    "summary": "",
    "experience": [{
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "isCurrentRole": false,
      "location": "",
      "responsibilities": ["Each bullet as separate array item"]
    }],
    "education": [{
      "degree": "",
      "institution": "",
      "startDate": "",
      "endDate": "",
      "location": "",
      "gpa": "",
      "fieldOfStudy": ""
    }],
    "skills": ["Individual skills"],
    "projects": [{
      "name": "",
      "description": "",
      "url": "",
      "technologies": [""]
    }],
    "certifications": [{
      "name": "",
      "issuer": "",
      "date": "",
      "url": ""
    }],
    "customization": {
      "template": "modern",
      "colorScheme": "modern",
      "iconStyle": "standard",
      "fontPairing": { "heading": "Plus Jakarta Sans", "body": "Inter" },
      "spacing": 16,
      "customCss": ""
    }
  },
  "confidence": {
    "overall": 0.95,
    "fields": {
      "personalInfo": 1.0,
      "experience": 0.9,
      "education": 0.85,
      "skills": 0.8
    }
  },
  "ambiguities": ["List any unclear or missing information"],
  "extractedMetrics": {
    "totalYearsExperience": 5,
    "quantifiableAchievements": 12,
    "skillsCount": 15,
    "detectedMetrics": ["Increased revenue by 25%", "Managed team of 8", "Reduced costs by $50K"]
  },
  "recommendations": {
    "templateStyle": "modern",
    "missingElements": [],
    "industryDetected": "Technology",
    "suggestedRole": "Senior Software Engineer",
    "strengthAreas": ["Technical depth", "Leadership experience"],
    "improvementAreas": ["Add more quantifiable results", "Include certifications"]
  }
}

${autoEnhance ? `
ENHANCEMENT MODE ACTIVE:
- If bullets are weak (lack action verbs or metrics), suggest improved versions in the recommendations
- If summary is missing, draft a preliminary one based on experience
- Normalize skill names (e.g., "reactjs" -> "React", "nodejs" -> "Node.js")
` : ""}

Return ONLY valid JSON.`;

  try {
    const messages: ChatMessage[] = [
      { role: "system", content: "You are a world-class resume parsing engine that returns only valid JSON." },
      { role: "user", content: `Output valid JSON.\n\n${prompt}` }
    ];

    const jsonText = await callLLM(messages, {
      temperature: 0.4,
      maxTokens: 5000,
      asJson: true,
    });
    const parsed = safeJsonParse<any>(jsonText, {});
    return coerceParseResult(parsed, rawText);
  } catch (error) {
    console.error("[groq] parseResumeContent failed:", error);
    return getFallbackParseResult(rawText);
  }
}

function coerceParseResult(parsed: any, rawText: string): ParseResult {
  const candidate =
    parsed?.extractedData ||
    parsed?.data?.extractedData ||
    parsed?.data ||
    (parsed?.personalInfo || parsed?.summary || parsed?.experience || parsed?.skills ? parsed : null);

  if (!candidate || typeof candidate !== "object") {
    return getFallbackParseResult(rawText);
  }

  const fallback = getFallbackParseResult(rawText).extractedData;
  const extractedData: ResumeData = {
    ...fallback,
    ...candidate,
    personalInfo: { ...fallback.personalInfo, ...(candidate.personalInfo || {}) },
    experience: Array.isArray(candidate.experience) ? candidate.experience : [],
    education: Array.isArray(candidate.education) ? candidate.education : [],
    skills: Array.isArray(candidate.skills)
      ? candidate.skills
      : typeof candidate.skills === "string"
      ? candidate.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    projects: Array.isArray(candidate.projects) ? candidate.projects : [],
    certifications: Array.isArray(candidate.certifications) ? candidate.certifications : [],
    customization: { ...fallback.customization, ...(candidate.customization || {}) },
  };

  const confidence = parsed?.confidence && typeof parsed.confidence === "object"
    ? parsed.confidence
    : { overall: 0.6, fields: {} };
  const ambiguities = Array.isArray(parsed?.ambiguities) ? parsed.ambiguities : [];
  const recommendations = parsed?.recommendations && typeof parsed.recommendations === "object"
    ? parsed.recommendations
    : {
        templateStyle: "modern",
        missingElements: [],
        industryDetected: "General",
      };

  return {
    extractedData,
    confidence,
    ambiguities,
    recommendations,
  } as ParseResult;
}

function getFallbackParseResult(rawText: string): ParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    rawText.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || "";
  const likelyName = lines[0] && lines[0].length < 60 ? lines[0] : "";
  const skillSectionIndex = lines.findIndex((l) => /skills?/i.test(l));
  let skills: string[] = [];
  if (skillSectionIndex >= 0) {
    const skillLines = lines.slice(skillSectionIndex + 1, skillSectionIndex + 5).join(", ");
    skills = skillLines
      .split(/[,|•·]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40);
  } else {
    skills = rawText
      .split(/[,|•·]/)
      .map((s) => s.trim())
      .filter((s) => /react|node|typescript|javascript|python|aws|sql|docker|kubernetes|java|c\+\+|go/i.test(s))
      .slice(0, 20);
  }

  const summary = lines
    .filter((l) => l.length > 30 && !/^\d/.test(l))
    .slice(0, 2)
    .join(" ")
    .slice(0, 400);

  return {
    extractedData: {
      personalInfo: {
        fullName: likelyName,
        email,
        phone,
        linkedin: "",
        portfolio: "",
        location: "",
      },
      summary: summary || rawText.slice(0, 220),
      experience: [],
      education: [],
      skills,
      projects: [],
      certifications: [],
      customization: {
        template: "modern",
        colorScheme: "modern",
        iconStyle: "standard",
        fontPairing: { heading: "Plus Jakarta Sans", body: "Inter" },
        spacing: 16,
        customCss: "",
      },
    },
    confidence: { overall: 0, fields: {} },
    ambiguities: [
      "AI parsing failed. Please manually enter your information.",
    ],
    recommendations: {
      templateStyle: "modern",
      missingElements: ["experience", "education", "skills", "personalInfo"],
      industryDetected: "Unknown",
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADVANCED BULLET ENHANCEMENT (Industry-Specific)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function enhanceBullet(
  options: BulletEnhancementOptions
): Promise<any> {
  const {
    text,
    jobTitle,
    company,
    industry,
    targetRole,
    targetIndustry,
    includeMetrics = true,
    strengthenImpact = true,
  } = options;

  const prompt = `
You are an elite resume writer specializing in ${industry} with deep expertise in crafting high-impact achievement statements for ALL industries.

CONTEXT:
- Original Bullet: "${text}"
- Role: ${jobTitle} at ${company}
- Industry: ${industry}
${targetRole ? `- Target Role: ${targetRole}` : ""}
${targetIndustry ? `- Target Industry: ${targetIndustry}` : ""}

ENHANCEMENT RULES:
1. **Action Verbs**: Start with powerful, industry-appropriate action verbs
   - Healthcare: "Administered", "Diagnosed", "Coordinated", "Implemented"
   - Finance: "Analyzed", "Forecasted", "Optimized", "Managed"
   - Sales: "Drove", "Exceeded", "Negotiated", "Closed"
   - Tech: "Architected", "Engineered", "Deployed", "Optimized"
   - Education: "Developed", "Instructed", "Assessed", "Mentored"
   - Marketing: "Launched", "Strategized", "Amplified", "Converted"

2. **Metrics & Impact**: ${includeMetrics ? "Include or suggest quantifiable metrics (%, $, time, people, outcomes)" : "Focus on qualitative impact"}
   - Use industry-appropriate metrics (patient outcomes, revenue, code quality, student performance, etc.)
   - Apply XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]"

3. **STAR Method**: Embed Situation, Task, Action, Result naturally

4. **Industry Terminology**: Use authentic ${industry} jargon and keywords

5. **Length**: Keep under 150 characters for optimal ATS and readability

Return JSON with this exact structure:
{
  "achievement_focused": "Version emphasizing measurable results and business impact",
  "technical_focused": "Version emphasizing methods, tools, processes, and technical depth",
  "leadership_focused": "Version emphasizing collaboration, ownership, and strategic thinking",
  "industry_optimized": "Version using maximum ${industry}-specific terminology for ATS",
  "recommendation": "Your top pick (copy the full text)",
  "reasoning": "2-3 sentences explaining why this is the best version for ${targetRole || jobTitle} in ${targetIndustry || industry}",
  "metrics_added": ["List any metrics or numbers added/suggested"],
  "keywords_injected": ["Industry keywords added for ATS optimization"]
}

${strengthenImpact ? `
CRITICAL: If the original bullet is weak (passive voice, no metrics, vague), dramatically strengthen it.
Example transformations:
- "Responsible for patient care" → "Delivered compassionate care to 15+ ICU patients daily, achieving 98% patient satisfaction scores"
- "Helped with sales" → "Drove $2.3M in new revenue by closing 45+ enterprise deals, exceeding quota by 23%"
- "Worked on codebase" → "Architected microservices migration reducing API latency by 40% and improving system reliability to 99.9%"
` : ""}

Return ONLY valid JSON.`;

  try {
    const response = await callGrok(
      "You are a resume bullet enhancement expert. Return only valid JSON.",
      prompt,
      true,
      0.4,
      8000,
      "rewriting"
    );
    // Cast the returned object safely. Some values are strings, some are arrays.
    return safeJsonParse<any>(response);
  } catch (error) {
    console.error("[groq] enhanceBullet failed:", error);
    return {
      achievement_focused: text,
      technical_focused: text,
      leadership_focused: text,
      industry_optimized: text,
      recommendation: text,
      reasoning: "Enhancement failed - using original text",
      metrics_added: [],
      keywords_injected: [],
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MULTI-STEP OPTIMIZATION (Iterative Refinement)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function multiStepOptimization(
  data: ResumeData,
  jobDescription: string,
  intent: GenerationIntent,
  steps: number = 3
): Promise<MultiStepOptimization[]> {
  const results: MultiStepOptimization[] = [];
  let currentData = data;

  for (let i = 0; i < steps; i++) {
    const stepPrompt = `
You are performing step ${i + 1} of ${steps} in an iterative resume optimization process.

CURRENT RESUME STATE:
${JSON.stringify(currentData)}

TARGET JOB DESCRIPTION:
${jobDescription}

INTENT:
${JSON.stringify(intent)}

PREVIOUS OPTIMIZATIONS:
${results.map(r => `Step ${r.step}: ${r.title} - ${r.changes.join(", ")}`).join("\n")}

STEP ${i + 1} FOCUS:
${i === 0 ? "1. Keyword optimization and industry alignment" : ""}
${i === 1 ? "2. Bullet point impact and quantification" : ""}
${i === 2 ? "3. Final polish, ATS formatting, and strategic emphasis" : ""}

For this step, make targeted improvements focused on the current priority. Return JSON:
{
  "improvedData": <full ResumeData object with improvements>,
  "changes": ["List of 3-5 specific changes made in this step"],
  "reasoning": "Why these changes improve the resume for this specific job",
  "focusArea": "What this step primarily improved (e.g., 'Keyword density', 'Quantifiable impact')"
}

RULES:
- Make meaningful, strategic changes - don't just rephrase
- Each step should build on the previous
- Preserve all existing data structure
- Don't invent facts, only enhance presentation
- Return ONLY valid JSON`;

    try {
      const response = await callGrok(
        "You are a strategic resume optimizer. Return only valid JSON.",
        stepPrompt,
        true,
        0.3 + (i * 0.1), // Slightly increase creativity each step
        8000,
        "rewriting"
      );
      
      const stepResult = safeJsonParse<{
        improvedData: ResumeData;
        changes: string[];
        reasoning: string;
        focusArea: string;
      }>(response);

      results.push({
        step: i + 1,
        title: stepResult.focusArea || `Optimization Step ${i + 1}`,
        changes: stepResult.changes,
        improvedData: stepResult.improvedData,
        reasoning: stepResult.reasoning,
      });

      currentData = stepResult.improvedData;
    } catch (error) {
      console.error(`[groq] Multi-step optimization step ${i + 1} failed:`, error);
      // Continue with current data if a step fails
      results.push({
        step: i + 1,
        title: `Step ${i + 1} (failed)`,
        changes: [],
        improvedData: currentData,
        reasoning: "This step encountered an error and was skipped",
      });
    }
  }

  return results;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTELLIGENT CLARIFYING QUESTIONS (Context-Aware)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function getClarifyingQuestions(
  missingFields: string[],
  userData: ResumeData,
  industryContext?: IndustryContext
): Promise<ClarifyingQuestion[]> {
  const prompt = `
You are an intelligent resume assistant helping complete a ${industryContext?.industry || "professional"} resume.

MISSING/WEAK FIELDS: ${missingFields.join(", ")}
CURRENT DATA: ${JSON.stringify(userData)}
${industryContext ? `INDUSTRY CONTEXT: ${JSON.stringify(industryContext)}` : ""}

Generate 3-6 strategic, conversational questions that will extract high-value information. 

QUESTION DESIGN PRINCIPLES:
1. Be specific and reference actual user data
2. Ask for quantifiable outcomes (metrics, numbers, results)
3. Use industry-appropriate language
4. Prioritize information that will most improve ATS score
5. Make questions conversational and encouraging

    "questions": [
      {
        "field": "Exact field that needs fabrication/guidance (e.g. experience.responsibilities)",
        "question": "A highly precise, single-sentence question proposing a fabricated scenario to see if the user agrees.",
        "type": "text",
        "placeholder": "Example of fabricated detail expected",
        "priority": "critical",
        "reasoning": "Why this data is being requested.",
        "industryRelevance": "Context linking"
      }
    ]
  }

  IMPORTANT FABRICATION RULES:
  1. DO NOT ask generic questions like "Could you provide more detail on X?"
  2. The LLM must intelligently FABRICATE likely realities or metrics based on the provided inputs and ask the user to confirm/deny/guide them.
  3. Example: Instead of "What was your impact here?", ask: "Did your work managing the backend lead to a 20%+ reduction in latency, or should we highlight a different metric like system up-time?"
  4. If you have absolutely nothing to go on, propose a standard industry expectation for their role and ask if they met it.

  Return ONLY valid JSON.`;

  try {
    const response = await callGrok(
      "You are a resume clarification engine. Return only valid JSON.",
      prompt,
      true,
      0.4,
      8000,
      "quick_feedback"
    );
    const parsed = safeJsonParse<{ questions: any[] }>(response);
    return (parsed.questions || []).map(q => ({
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      field: q.field || 'General',
      text: q.text || q.question || 'Could you provide more detail on this section?',
      type: q.type || 'text',
      placeholder: q.placeholder || 'Your response...'
    })) as ClarifyingQuestion[];
  } catch (error) {
    console.error("[groq] getClarifyingQuestions failed:", error);
    return getFallbackQuestions(missingFields, industryContext);
  }
}

function getFallbackQuestions(
  missingFields: string[],
  industryContext?: IndustryContext
): ClarifyingQuestion[] {
  const industryTerm = industryContext?.industry || "professional";
  return missingFields.slice(0, 5).map((field, index) => ({
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `fb-${Date.now()}-${index}`,
    field,
    text: `To help me fill in your ${field}, I'm analyzing standard ATS requirements for a ${industryTerm} role. Could you confirm if you have experience with [Example Key Skill/Task related to ${field}], or should I focus this section on something else?`,
    type: "text" as const,
    placeholder: "Yes, I specialized in...",
  }));
}

/* ═══════════════════════════════════════════════════════════════════════════
   OPTIMIZE FOR JOB (Industry-Intelligent)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function optimizeResumeForJob(
  data: ResumeData,
  jobDescription: string,
  tone: GenerationIntent["tone"],
  industryContext?: IndustryContext
): Promise<ResumeData> {
  const prompt = `
You are an elite resume strategist with expertise across ALL industries, particularly ${industryContext?.industry || "various fields"}.

Your mission: Transform this resume to be the PERFECT match for the target job while maintaining 100% truthfulness.

CURRENT RESUME:
${JSON.stringify(data)}

TARGET JOB DESCRIPTION:
${jobDescription}

${industryContext ? `
INDUSTRY INTELLIGENCE:
- Industry: ${industryContext.industry}${industryContext.subIndustry ? ` (${industryContext.subIndustry})` : ""}
- Key Terminology: ${industryContext.keyTerminology.slice(0, 15).join(", ")}
- Essential Skills: ${industryContext.essentialSkills.join(", ")}
- Common Metrics: ${industryContext.commonMetrics.join(", ")}
- Tone Guidance: ${industryContext.toneGuidance}
` : ""}

OPTIMIZATION STRATEGY:

1. **PROFESSIONAL SUMMARY** (Critical for ATS):
   - Rewrite as a powerful 3-4 sentence pitch
   - Weave in 5-7 keywords from the JD naturally
   - Match tone: "${tone}"
   - Position candidate as the ideal fit
   - Include 1-2 quantified highlights
   - Never use first person (I, me, my)

2. **EXPERIENCE BULLETS** (The Core):
   - Transform EVERY bullet using this formula: [Action Verb] + [Specific Task] + [Quantifiable Result]
   - Industry-appropriate action verbs for ${industryContext?.industry || "this field"}
   - Extract and amplify ALL metrics
   - If metrics are vague, add logical placeholders: [X]%, [Y] patients, [$Z]K
   - Subtly inject JD keywords into context
   - Reorder bullets: most relevant to JD first

3. **SKILLS OPTIMIZATION**:
   - Extract ALL skills mentioned in JD
   - Reorder existing skills: JD matches first
   - Add missing skills ONLY if experience clearly implies them
   - Use exact terminology from JD (e.g., if JD says "Salesforce CRM", don't just say "CRM")
   - Group by category if appropriate (Technical, Leadership, etc.)
   - Deduplicate and normalize

4. **STRATEGIC KEYWORD SATURATION**:
   - Identify top 20 keywords from JD
   - Ensure they appear naturally throughout (summary, bullets, skills)
   - Use ${industryContext?.industry || "industry"}-specific terminology
   - Mirror the language style of the JD

5. **ATS OPTIMIZATION**:
   - Use standard section names
   - Ensure dates are consistent format
   - No tables or complex formatting in JSON
   - Skills as simple array

INTEGRITY RULES:
- NEVER invent job titles, companies, degrees, or dates
- NEVER add experience that doesn't exist
- ONLY enhance the presentation of existing facts
- If adding a skill, it MUST be inferable from listed experience
- Maintain exact JSON structure

OUTPUT FORMAT:
Return a JSON object that strictly matches the ResumeData interface:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "" },
  "summary": "...",
  "experience": [{ "jobTitle": "", "company": "", "startDate": "", "endDate": "", "isCurrentRole": false, "location": "", "responsibilities": ["string", "string"] }],
  "education": [{ "degree": "", "institution": "", "startDate": "", "endDate": "", "location": "", "gpa": "", "fieldOfStudy": "" }],
  "skills": ["string", "string"],
  "projects": [{ "name": "", "description": "", "url": "", "technologies": ["string"] }],
  "certifications": [{ "name": "", "issuer": "", "date": "", "url": "" }],
  "customization": { "template": "", "colorScheme": "", "iconStyle": "", "fontPairing": { "heading": "", "body": "" }, "spacing": 16, "customCss": "" }
}

Return ONLY the complete, optimized ResumeData JSON. No markdown.`;

  try {
    const json = await callGrok(
      "You are a resume optimization engine. Return ONLY valid JSON.",
      prompt,
      true,
      0.4,
      8000,
      "rewriting"
    );
    const result = safeJsonParse<ResumeData>(json, data);

    // Preserve critical fields that should never change
    if (!result.personalInfo) result.personalInfo = data.personalInfo;
    if (!result.customization) result.customization = data.customization;
    
    // Validate arrays exist
    result.experience = result.experience || data.experience;
    result.education = result.education || data.education;
    result.skills = result.skills || data.skills;

    return result;
  } catch (error) {
    console.error("[groq] optimizeResumeForJob failed:", error);
    return data;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   POST-PROCESS RESUME (Enhanced)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function postProcessResume(
  data: ResumeData,
  clarifications: Record<string, string> | undefined,
  intent: GenerationIntent,
  industryContext?: IndustryContext
): Promise<ResumeData> {
  const prompt = `
You are a senior resume editor specializing in ${industryContext?.industry || "professional"} resumes.

Normalize, refine, and polish this resume to professional standards.

INPUT DATA:
${JSON.stringify(data)}

USER CLARIFICATIONS:
${JSON.stringify(clarifications || {})}

INTENT:
${JSON.stringify(intent)}

${industryContext ? `INDUSTRY STANDARDS FOR ${industryContext.industry}:
- Tone: ${industryContext.toneGuidance}
- Key skills: ${industryContext.essentialSkills.join(", ")}
- Typical metrics: ${industryContext.commonMetrics.join(", ")}
` : ""}

EDITING RULES:

1. **Grammar & Consistency**:
   - Past tense for previous roles, present for current (isCurrentRole: true)
   - Consistent date format: "MMM YYYY" (e.g., "Jan 2020")
   - No typos or grammatical errors
   - Consistent punctuation (periods at end of bullets or no periods - pick one)

2. **Bullet Points**:
   - Each must start with strong action verb
   - Include quantifiable impact where possible
   - Keep as array of individual strings (don't combine)
   - Optimal length: 10-25 words per bullet
   - No first person pronouns

3. **Skills**:
   - Array of properly capitalized, individual skills
   - Deduplicate (remove "JavaScript" if "JavaScript (ES6+)" exists)
   - Normalize names (react → React, nodejs → Node.js, aws → AWS)
   - Remove generic fluff ("hard worker", "team player")

4. **Summary**:
   - 3-4 sentences, no more
   - Tailored to ${intent.targetRole} in ${intent.targetIndustry}
   - Tone: ${intent.tone}
   - Include 1-2 quantified highlights
   - Never use "I" or "my"

5. **Integration**:
   - Weave clarification answers into appropriate fields naturally
   - If user provided metrics in clarifications, add them to relevant bullets

6. **Validation**:
   - Ensure isCurrentRole aligns with endDate
   - All dates should be strings in consistent format
   - Phone numbers in standard format
   - Email addresses valid

PRESERVE:
- Exact job titles, company names, degrees (don't change these)
- Dates (only format consistently)
- Structure and field names

OUTPUT FORMAT:
Return a JSON object that strictly matches the ResumeData interface:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "portfolio": "" },
  "summary": "...",
  "experience": [{ "jobTitle": "", "company": "", "startDate": "", "endDate": "", "isCurrentRole": false, "location": "", "responsibilities": ["string", "string"] }],
  "education": [{ "degree": "", "institution": "", "startDate": "", "endDate": "", "location": "", "gpa": "", "fieldOfStudy": "" }],
  "skills": ["string", "string"],
  "projects": [{ "name": "", "description": "", "url": "", "technologies": ["string"] }],
  "certifications": [{ "name": "", "issuer": "", "date": "", "url": "" }],
  "customization": { "template": "", "colorScheme": "", "iconStyle": "", "fontPairing": { "heading": "", "body": "" }, "spacing": 16, "customCss": "" }
}

Return ONLY the refined ResumeData JSON. No markdown.`;

  try {
    const json = await callGrok(
      "You are a resume editor. Return ONLY valid ResumeData JSON.",
      prompt,
      true,
      0.2,
      8000,
      "rewriting"
    );
    const result = safeJsonParse<ResumeData>(json, data);

    // Validate critical fields
    if (!result.personalInfo) result.personalInfo = data.personalInfo;
    if (!result.experience) result.experience = data.experience;
    if (!result.education) result.education = data.education;
    if (!result.skills) result.skills = data.skills;
    if (!result.customization) result.customization = data.customization;

    return result;
  } catch (error) {
    console.error("[groq] postProcessResume failed:", error);
    return data;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REWRITE SUMMARY (Industry-Specific)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function rewriteSummary(
  summary: string,
  role: string,
  industry: string,
  tone: GenerationIntent["tone"],
  keywords?: string[]
): Promise<string> {
  const prompt = `
Rewrite this professional summary to be a powerful, ATS-optimized pitch for a ${role} position in ${industry}.

CURRENT SUMMARY:
${summary}

TARGET ROLE: ${role}
TARGET INDUSTRY: ${industry}
DESIRED TONE: ${tone}
${keywords ? `KEYWORDS TO INCLUDE: ${keywords.join(", ")}` : ""}

REQUIREMENTS:
1. Exactly 3-4 sentences
2. First sentence: Your professional identity and years/level of experience
3. Second sentence: Core competencies and key strengths
4. Third sentence: Signature achievement or unique value proposition
5. Optional fourth: Career goal or what you bring to the role

STYLE GUIDE:
- NO first person (I, me, my, we, our)
- Start with powerful descriptors: "Accomplished", "Strategic", "Results-driven", "Certified"
- Include 1-2 quantified highlights if possible
- Use ${industry}-specific terminology naturally
- Match ${tone} tone exactly
- Weave in keywords organically (no keyword stuffing)

EXAMPLES BY INDUSTRY:
- Healthcare: "Compassionate Registered Nurse with 7+ years in acute care settings, specializing in patient advocacy and clinical excellence. Proven expertise in..."
- Tech: "Full-Stack Software Engineer with 5 years architecting scalable solutions for enterprise SaaS platforms. Specialized in React, Node.js, and cloud infrastructure..."
- Sales: "Results-driven Sales Executive with consistent record of exceeding quotas by 30%+ annually. Expert in consultative selling, pipeline management, and enterprise client relationships..."
- Finance: "Detail-oriented Financial Analyst with 6 years in investment banking and corporate finance. Specialized in financial modeling, risk assessment, and strategic planning..."

Return ONLY the rewritten summary text, nothing else. No quotes, no markdown.`;

  try {
    const text = await callGrok(
      "You are a professional summary writer. Return only the summary text.",
      prompt,
      false,
      0.5,
      2000,
      "rewriting"
    );
    return text.trim().replace(/^["']|["']$/g, ""); // Remove quotes if present
  } catch (error) {
    console.error("[groq] rewriteSummary failed:", error);
    return summary;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   GENERATE RESUME HTML (Enhanced with Industry Templates)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function generateResumeHtml(
  intent: GenerationIntent,
  data: ResumeData,
  industryContext?: IndustryContext
): Promise<string> {
  const prompt = `
You are an elite resume designer with expertise in creating industry-specific, ATS-compliant HTML resumes.

INTENT: ${JSON.stringify(intent)}
DATA: ${JSON.stringify(data)}
${industryContext ? `INDUSTRY: ${industryContext.industry} (${industryContext.toneGuidance})` : ""}

DESIGN REQUIREMENTS:

1. **ATS COMPATIBILITY** (Critical):
   - Semantic HTML5: <header>, <main>, <section>, <article>
   - <h1> for name ONLY
   - <h2> for section headers (Experience, Education, Skills, etc.)
   - NO tables for layout
   - NO background images
   - Standard section names
   - Linear, top-to-bottom reading order

2. **VISUAL DESIGN**:
   - Template: ${intent.designPreferences.template}
   - Primary color: #1a365d, Accent: #2b6cb0
   - Icons: ${intent.designPreferences.iconStyle}
   - Typography: 
     * Headers: Plus Jakarta Sans
     * Body: Inter
     * Name: 28-34px
     * Section headers: 16-18px
     * Body: 10-11px
   - White space: Generous but efficient for single page

3. **INDUSTRY STYLING**:
${industryContext?.industry === "Healthcare" ? "   - Clean, clinical aesthetic with calming blues" : ""}
${industryContext?.industry === "Finance" ? "   - Conservative, serif accents, formal tone" : ""}
${industryContext?.industry === "Technology" ? "   - Modern, minimalist, accent on technical skills" : ""}
${industryContext?.industry === "Creative" || industryContext?.industry === "Marketing" ? "   - Bold headers, creative use of color, portfolio emphasis" : ""}
${!industryContext || industryContext.industry === "General" ? "   - Professional, versatile design" : ""}

4. **CONTENT OPTIMIZATION**:
   - Automatically enhance bullet points (action verbs, metrics)
   - Highlight key skills for ${intent.targetRole}
   - Emphasize: ${intent.emphasize.join(", ")}
   - Tone: ${intent.tone}

5. **PRINT OPTIMIZATION**:
   - Max width: 850px
   - Page breaks: avoid inside sections
   - Margins: 0.5-0.75in equivalent
   - Ensure fits on 1 page (or clean 2-page break if necessary)

6. **RESPONSIVE**:
   - Mobile-friendly
   - Scales well 600px-1200px

Return ONLY complete, valid HTML with inline CSS or <style> block.
Include <!DOCTYPE html>, full <head> with meta tags and fonts.
NO markdown code fences. NO explanations.`;

  try {
    const html = await callGrok(
      "You are a resume HTML generator. Return ONLY valid HTML, no markdown.",
      prompt,
      false,
      0.4,
      8000,
      "rewriting"
    );

    if (!html.includes("<") || !html.includes("html")) {
      console.warn("[groq] Invalid HTML response, using fallback");
      return fallbackHtml(data);
    }

    return html;
  } catch (error) {
    console.error("[groq] generateResumeHtml failed:", error);
    return fallbackHtml(data);
  }
}

function fallbackHtml(data: ResumeData): string {
  const skills = Array.isArray(data.skills)
    ? data.skills.join(" · ")
    : data.skills;
  const experience = data.experience
    .map(
      (item) => `
      <article>
        <h3>${item.jobTitle} · ${item.company}</h3>
        <p>${item.startDate} - ${item.isCurrentRole ? "Present" : item.endDate || ""}</p>
        <ul>${(Array.isArray(item.responsibilities)
          ? item.responsibilities
          : item.responsibilities.split("\n")
        )
          .map((bullet) => `<li>${bullet}</li>`)
          .join("")}</ul>
      </article>
    `
    )
    .join("");
  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${data.personalInfo.fullName || "Resume"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',Arial,sans-serif;color:#1a202c;background:#fff;font-size:11px;line-height:1.6}
.resume{max-width:850px;margin:0 auto;padding:32px}
header{margin-bottom:24px;border-bottom:2px solid #1a365d;padding-bottom:16px}
h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:32px;color:#1a365d;margin-bottom:8px}
.contact{display:flex;gap:16px;flex-wrap:wrap;color:#4a5568;font-size:10px}
h2{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;color:#1a365d;margin:20px 0 12px;padding-bottom:4px;border-bottom:1px solid #cbd5e0;text-transform:uppercase;letter-spacing:0.5px}
h3{font-size:12px;font-weight:600;margin-bottom:4px;color:#2d3748}
p{margin:4px 0;color:#4a5568}
ul{margin:8px 0 16px 20px}
li{margin-bottom:6px;color:#2d3748}
.section{margin-bottom:20px;page-break-inside:avoid}
@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{padding:0}.resume{padding:24px}h2{color:#000;border-color:#000}}
@media (max-width:768px){.resume{padding:16px}h1{font-size:24px}}
</style>
</head>
<body>
<main class="resume">
<header>
<h1>${data.personalInfo.fullName}</h1>
<div class="contact">
${data.personalInfo.email ? `<span>${data.personalInfo.email}</span>` : ""}
${data.personalInfo.phone ? `<span>${data.personalInfo.phone}</span>` : ""}
${data.personalInfo.location ? `<span>${data.personalInfo.location}</span>` : ""}
${data.personalInfo.linkedin ? `<span>${data.personalInfo.linkedin}</span>` : ""}
</div>
</header>
${data.summary ? `<section class="section"><h2>Professional Summary</h2><p>${data.summary}</p></section>` : ""}
<section class="section"><h2>Experience</h2>${experience}</section>
<section class="section"><h2>Education</h2>${data.education
    .map(
      (item) =>
        `<p><strong>${item.degree}</strong> · ${item.institution}${item.graduationDate ? ` · ${item.graduationDate}` : ""}</p>`
    )
    .join("")}</section>
${skills ? `<section class="section"><h2>Skills</h2><p>${skills}</p></section>` : ""}
</main>
</body>
</html>
`.trim();
}

/* ═══════════════════════════════════════════════════════════════════════════
   BATCH BULLET ENHANCEMENT (Process multiple at once for efficiency)
   ═══════════════════════════════════════════════════════════════════════════ */

export async function enhanceBulletsBatch(
  bullets: { text: string; context: BulletEnhancementOptions }[]
): Promise<Map<string, Record<string, string>>> {
  const prompt = `
You are processing multiple resume bullets for enhancement. Return improvements for each.

BULLETS TO ENHANCE:
${JSON.stringify(bullets, null, 2)}

For EACH bullet, return the same enhancement structure as the single bullet enhancer.

Return JSON:
{
  "enhancements": {
    "0": { achievement_focused, technical_focused, leadership_focused, industry_optimized, recommendation, reasoning },
    "1": { ... },
    ...
  }
}

Return ONLY valid JSON.`;

  try {
    const response = await callGrok(
      "You are a batch resume enhancer. Return only valid JSON.",
      prompt,
      true,
      0.4,
      8000,
      "rewriting"
    );
    const result = safeJsonParse<{ enhancements: Record<string, Record<string, string>> }>(response);
    
    const map = new Map<string, Record<string, string>>();
    Object.entries(result.enhancements).forEach(([idx, enhancement]) => {
      map.set(bullets[parseInt(idx)].text, enhancement);
    });
    
    return map;
  } catch (error) {
    console.error("[groq] Batch enhancement failed:", error);
    return new Map();
  }
}
