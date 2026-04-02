import { ResumeData } from "@/types/resume";
import { callGrok } from "./grok";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type AtsBreakdown = {
  keywordMatch: number;
  skillsCoverage: number;
  experienceRelevance: number;
  bulletImpact: number;
  formatting: number;
  sectionCompleteness: number;
  quantificationDensity: number;
  readabilityClarity: number;
  relevancyAlignment: number;
  atsCompatibility: number;
  industryAlignment: number;
};

export type AtsResult = {
  score: number;
  grade: string;
  breakdown: AtsBreakdown;
  keywords: string[];
  suggestions: AtsSuggestion[];
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  redFlags: RedFlag[];
  sectionScores: SectionScore[];
  detectedIndustry: string;
  detectedRole: string;
  aiAnalysis?: AiAtsAnalysis | null;
  aiEnhancedScoring?: AiScoringEnhancement | null;
};

export type AtsSuggestion = {
  category: "critical" | "high" | "medium" | "low";
  section: string;
  message: string;
  actionItem: string;
  impact: string; // What improvement this will make to score
};

export type RedFlag = {
  severity: "critical" | "warning" | "info";
  issue: string;
  fix: string;
  section: string;
};

export type SectionScore = {
  section: string;
  score: number;
  maxScore: number;
  issues: string[];
};

export interface AiAtsAnalysis {
  overallAssessment: string;
  strengthAreas: string[];
  improvementAreas: string[];
  keywordSuggestions: string[];
  bulletRewrites: { original: string; improved: string; reason: string }[];
  tailoredSummary: string;
  industryInsights: string;
  competitiveScore: number;
  roleAlignmentAnalysis: string;
  seniorityMatch: string;
  cultureFitIndicators: string[];
  dealBreakers: string[];
}

// NEW: AI-enhanced scoring layer
export interface AiScoringEnhancement {
  detectedIndustry: string;
  detectedJobRole: string;
  industrySpecificKeywords: string[];
  contextualSkillMatches: {
    skill: string;
    foundAs: string;
    relevanceScore: number;
  }[];
  hiddenStrengths: string[]; // Things the resume has that aren't obvious
  criticalGaps: string[]; // Must-haves that are missing
  toneAnalysis: {
    professionalismScore: number; // 0-100
    industryAppropriate: boolean;
    issues: string[];
  };
  experienceQualityScore: number; // 0-100 based on actual content analysis
  adjustedBreakdown: Partial<AtsBreakdown>; // AI-suggested adjustments
  confidenceLevel: number; // How confident the AI is in its analysis (0-100)
}

/* ═══════════════════════════════════════════════════════════════════════════
   UNIVERSAL CONSTANTS (Industry-Agnostic)
   ═══════════════════════════════════════════════════════════════════════════ */

const STOPWORDS = new Set([
  "the", "and", "a", "an", "to", "of", "in", "for", "on", "with", "at",
  "by", "from", "as", "is", "are", "be", "or", "this", "that", "it",
  "will", "can", "you", "we", "our", "your", "their", "they", "was",
  "were", "been", "being", "have", "has", "had", "do", "does", "did",
  "not", "but", "if", "about", "into", "through", "during", "before",
  "after", "above", "below", "between", "under", "over", "out", "up",
  "down", "off", "then", "than", "too", "very", "just", "also", "more",
  "most", "other", "some", "such", "only", "own", "same", "so", "able",
  "all", "any", "each", "every", "few", "many", "much", "may", "might",
  "must", "shall", "should", "would", "could", "need", "make", "work",
  "use", "using", "used", "well", "new", "like", "get", "one", "two",
  "know", "take", "come", "good", "great", "help", "way", "role",
  "looking", "including", "etc", "per", "via", "within", "across",
]);

// Universal action verbs across all industries
const ACTION_VERBS_TIER1 = new Set([
  "spearheaded", "pioneered", "revolutionized", "transformed", "orchestrated",
  "architected", "championed", "launched", "overhauled", "instituted",
  "established", "founded", "initiated", "devised", "engineered",
]);

const ACTION_VERBS_TIER2 = new Set([
  "delivered", "led", "built", "designed", "developed", "implemented",
  "created", "optimized", "reduced", "increased", "improved", "drove",
  "managed", "directed", "executed", "accelerated", "generated",
  "negotiated", "coordinated", "facilitated", "achieved", "attained",
  "secured", "streamlined", "expanded", "cultivated", "strengthened",
  "enhanced", "maximized", "automated", "consolidated", "restructured",
  "supervised", "administered", "operated", "conducted", "performed",
]);

const ACTION_VERBS_TIER3 = new Set([
  "assisted", "supported", "contributed", "collaborated", "participated",
  "helped", "maintained", "monitored", "updated", "organized", "prepared",
  "coordinated", "scheduled", "processed", "handled", "reviewed",
  "documented", "tracked", "analyzed", "evaluated", "assessed",
]);

const WEAK_VERBS = new Set([
  "responsible", "duties", "worked", "did", "made", "got", "went",
  "was", "had", "tried", "tasked", "involved", "utilized", "leveraged",
]);

const BUZZWORDS_PENALTY = new Set([
  "synergy", "leverage", "paradigm", "bandwidth", "circle back",
  "move the needle", "deep dive", "thought leader", "ninja", "rockstar",
  "guru", "unicorn", "disrupt", "hack", "crushing it", "passionate",
  "self-starter", "go-getter", "team player", "detail-oriented",
  "results-driven", "hard-working", "think outside the box",
  "hit the ground running", "best of breed", "low hanging fruit",
]);

const SENIORITY_KEYWORDS: Record<string, string[]> = {
  intern: ["intern", "internship", "co-op", "trainee", "apprentice"],
  junior: ["junior", "entry level", "entry-level", "associate", "graduate", "jr", "assistant"],
  mid: ["mid-level", "mid level", "intermediate", "specialist", "analyst"],
  senior: ["senior", "sr", "lead", "principal", "staff", "expert", "advanced"],
  manager: ["manager", "management", "supervisor", "team lead", "director", "head of"],
  executive: ["vp", "vice president", "svp", "evp", "cto", "ceo", "cfo", "coo", "chief", "c-level", "executive", "president"],
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI-POWERED INDUSTRY DETECTION & CONTEXT UNDERSTANDING
   ═══════════════════════════════════════════════════════════════════════════ */

interface IndustryContext {
  industry: string;
  role: string;
  keywords: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  certifications: string[];
  softSkills: string[];
  technicalSkills: string[];
  seniorityLevel: string;
  yearsRequired: number | null;
  educationRequired: string;
}

async function detectIndustryAndContext(jobDescription: string): Promise<IndustryContext> {
  const prompt = `
Analyze this job description and extract structured information. Be PRECISE and only extract what's explicitly mentioned.

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with this exact structure:
{
  "industry": "The specific industry (e.g., Healthcare, Finance, Technology, Retail, Manufacturing, Education, Marketing, Sales, Legal, etc.)",
  "role": "The specific job role/title (e.g., Registered Nurse, Financial Analyst, Sales Manager, etc.)",
  "keywords": ["20-30 most important keywords/phrases from the JD, including industry jargon"],
  "requiredSkills": ["Skills explicitly marked as required/must-have"],
  "preferredSkills": ["Skills marked as preferred/nice-to-have"],
  "certifications": ["Any certifications, licenses, or credentials mentioned"],
  "softSkills": ["Soft skills like communication, leadership, problem-solving"],
  "technicalSkills": ["Technical/hard skills specific to the role"],
  "seniorityLevel": "intern, junior, mid, senior, manager, or executive",
  "yearsRequired": <number or null>,
  "educationRequired": "none, highschool, associate, bachelors, masters, phd, or certification"
}

IMPORTANT:
- If something isn't mentioned, use empty arrays or null
- For keywords, include multi-word phrases (e.g., "patient care", "financial modeling")
- Be industry-specific: "sales quota" for sales, "patient outcomes" for healthcare, etc.
- Return ONLY valid JSON, no markdown`;

  try {
    const response = await callGrok(
      "You are an expert recruiter and industry analyst. Return only valid JSON.",
      prompt,
      true
    );
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned) as IndustryContext;
  } catch (error) {
    console.error("AI industry detection failed:", error);
    // Fallback to basic parsing
    return fallbackIndustryDetection(jobDescription);
  }
}

function fallbackIndustryDetection(jd: string): IndustryContext {
  const lower = jd.toLowerCase();
  
  // Simple industry detection
  let industry = "General";
  if (/(nurse|medical|patient|healthcare|hospital|clinical)/i.test(jd)) industry = "Healthcare";
  else if (/(software|developer|engineer|code|programming|tech)/i.test(jd)) industry = "Technology";
  else if (/(sales|revenue|quota|pipeline|crm)/i.test(jd)) industry = "Sales";
  else if (/(marketing|campaign|seo|content|brand)/i.test(jd)) industry = "Marketing";
  else if (/(finance|accounting|financial|audit|tax)/i.test(jd)) industry = "Finance";
  else if (/(teacher|education|curriculum|student)/i.test(jd)) industry = "Education";
  else if (/(legal|attorney|law|compliance|contract)/i.test(jd)) industry = "Legal";
  else if (/(retail|customer service|sales associate|cashier)/i.test(jd)) industry = "Retail";

  return {
    industry,
    role: "Unknown",
    keywords: extractKeywords(jd, 25),
    requiredSkills: [],
    preferredSkills: [],
    certifications: [],
    softSkills: [],
    technicalSkills: [],
    seniorityLevel: detectSeniority(jd),
    yearsRequired: extractYearsRequired(jd),
    educationRequired: detectEducationLevel(jd),
  };
}

function detectSeniority(text: string): string {
  const lower = text.toLowerCase();
  for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return level;
  }
  return "mid";
}

function extractYearsRequired(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i);
  return match ? parseInt(match[1]) : null;
}

function detectEducationLevel(text: string): string {
  if (/ph\.?d|doctorate/i.test(text)) return "phd";
  if (/master'?s?|mba|m\.?s\.?|m\.?a\.?/i.test(text)) return "masters";
  if (/bachelor'?s?|b\.?s\.?|b\.?a\.?|undergraduate|degree/i.test(text)) return "bachelors";
  if (/associate|a\.?s\.?|a\.?a\.?/i.test(text)) return "associate";
  if (/high school|diploma|ged/i.test(text)) return "highschool";
  if (/certified|certification|license/i.test(text)) return "certification";
  return "none";
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI-ENHANCED RESUME ANALYSIS
   ═══════════════════════════════════════════════════════════════════════════ */

async function aiEnhancedResumeAnalysis(
  resume: ResumeData,
  industryContext: IndustryContext
): Promise<AiScoringEnhancement> {
  const prompt = `
You are an expert ATS system and recruiter specializing in ${industryContext.industry} for ${industryContext.role} roles.

Analyze this resume in the context of the job requirements. Look beyond surface-level keyword matching.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB CONTEXT:
Industry: ${industryContext.industry}
Role: ${industryContext.role}
Required Skills: ${industryContext.requiredSkills.join(", ")}
Required Certifications: ${industryContext.certifications.join(", ")}
Seniority: ${industryContext.seniorityLevel}
Years Required: ${industryContext.yearsRequired || "Not specified"}

TASKS:
1. Find CONTEXTUAL skill matches - e.g., if JD requires "customer relationship management" and resume says "managed 200+ client accounts", that's a match
2. Identify hidden strengths not obvious from keywords
3. Spot critical gaps that would disqualify this candidate
4. Analyze tone and professionalism for this industry
5. Evaluate actual quality of experience descriptions

Return JSON:
{
  "detectedIndustry": "What industry does this resume suggest?",
  "detectedJobRole": "What role is this person best suited for?",
  "industrySpecificKeywords": ["Industry jargon/terminology found in resume"],
  "contextualSkillMatches": [
    {
      "skill": "Required skill from JD",
      "foundAs": "How it appears in resume (quote the text)",
      "relevanceScore": <0-100>
    }
  ],
  "hiddenStrengths": ["Strengths not captured by keyword matching"],
  "criticalGaps": ["Must-have requirements that are completely missing"],
  "toneAnalysis": {
    "professionalismScore": <0-100>,
    "industryAppropriate": true/false,
    "issues": ["Specific tone/language issues"]
  },
  "experienceQualityScore": <0-100, based on depth, relevance, and impact>,
  "adjustedBreakdown": {
    "keywordMatch": <0-1>,
    "skillsCoverage": <0-1>,
    "experienceRelevance": <0-1>,
    "industryAlignment": <0-1>
  },
  "confidenceLevel": <0-100, how confident you are in this analysis>
}

Be CRITICAL. Don't inflate scores. If experience is generic, say so. If tone is wrong for the industry, flag it.
Return ONLY valid JSON.`;

  try {
    const response = await callGrok(
      "You are an expert ATS analyzer and recruiter. Return only valid JSON.",
      prompt,
      true,
      0.3,
      8000,
      "ats_scoring"
    );
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned) as AiScoringEnhancement;
  } catch (error) {
    console.error("AI resume analysis failed:", error);
    return {
      detectedIndustry: industryContext.industry,
      detectedJobRole: industryContext.role,
      industrySpecificKeywords: [],
      contextualSkillMatches: [],
      hiddenStrengths: [],
      criticalGaps: [],
      toneAnalysis: {
        professionalismScore: 50,
        industryAppropriate: true,
        issues: [],
      },
      experienceQualityScore: 50,
      adjustedBreakdown: {},
      confidenceLevel: 0,
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT PROCESSING UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+.#%$]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t) && t.length > 1);
}

function extractKeywords(text: string, limit = 30): string[] {
  const tokens = tokenize(text);
  const freq: Record<string, number> = {};
  
  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }

  // Also extract important phrases (2-3 word combinations)
  const phrases: string[] = [];
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!STOPWORDS.has(words[i]) && !STOPWORDS.has(words[i + 1])) {
      phrases.push(bigram);
    }
  }

  const allTerms = [
    ...Object.entries(freq).map(([word, count]) => ({ term: word, score: count })),
    ...phrases.map(p => ({ term: p, score: 1.5 })) // Boost phrases
  ];

  return allTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((t) => t.term);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESUME NORMALIZER
   ═══════════════════════════════════════════════════════════════════════════ */

interface NormalizedResume {
  fullText: string;
  skills: string[];
  bullets: string[];
  experienceTitles: string[];
  totalExperienceMonths: number;
  hasSummary: boolean;
  summaryLength: number;
  sectionCount: number;
  wordCount: number;
  educationLevel: string;
}

function normalizeResume(resume: ResumeData): NormalizedResume {
  const parts: string[] = [];
  parts.push(resume.personalInfo?.fullName || "");
  parts.push(resume.summary || "");

  const experienceTitles: string[] = [];
  const bullets: string[] = [];

  for (const e of resume.experience || []) {
    parts.push(e.jobTitle || "");
    parts.push(e.company || "");
    experienceTitles.push(e.jobTitle || "");

    const r = Array.isArray(e.responsibilities)
      ? e.responsibilities
      : (e.responsibilities || "").split("\n");
    const cleanBullets = r.map((b) => b.trim()).filter(Boolean);
    bullets.push(...cleanBullets);
    parts.push(cleanBullets.join(" "));
  }

  for (const edu of resume.education || []) {
    parts.push(edu.degree || "");
    parts.push(edu.institution || "");
    parts.push(edu.fieldOfStudy || "");
  }

  const skills = Array.isArray(resume.skills)
    ? resume.skills
    : (resume.skills || "")
        .split(/[,\n;|]/)
        .map((s: string) => s.trim())
        .filter(Boolean);

  const fullText = parts.join(" ").trim();
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  let totalExperienceMonths = 0;
  for (const e of resume.experience || []) {
    const start = parseDate(e.startDate);
    const end = e.endDate?.toLowerCase() === "present" ? new Date() : parseDate(e.endDate);
    if (start && end) {
      totalExperienceMonths += monthsBetween(start, end);
    }
  }

  const educationLevel = detectResumeEducationLevel(resume.education || []);

  const sectionCount = [
    resume.personalInfo?.fullName,
    resume.summary,
    (resume.experience || []).length > 0,
    (resume.education || []).length > 0,
    skills.length > 0,
  ].filter(Boolean).length;

  return {
    fullText,
    skills,
    bullets,
    experienceTitles,
    totalExperienceMonths,
    hasSummary: Boolean(resume.summary && resume.summary.length > 20),
    summaryLength: (resume.summary || "").length,
    sectionCount,
    wordCount,
    educationLevel,
  };
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function monthsBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function detectResumeEducationLevel(education: any[]): string {
  const degreeMap: Record<string, number> = {
    phd: 5, doctorate: 5, "ph.d": 5,
    masters: 4, master: 4, mba: 4, msc: 4, "m.s": 4, "m.a": 4,
    bachelors: 3, bachelor: 3, "b.s": 3, "b.a": 3, bsc: 3,
    associate: 2, "a.s": 2, "a.a": 2,
    diploma: 1, certificate: 1,
  };

  let highest = 0;
  let level = "none";
  for (const edu of education) {
    const degree = (edu.degree || "").toLowerCase();
    for (const [key, val] of Object.entries(degreeMap)) {
      if (degree.includes(key) && val > highest) {
        highest = val;
        level = key;
      }
    }
  }
  return level;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCORING MODULES
   ═══════════════════════════════════════════════════════════════════════════ */

function keywordMatchScore(
  resumeTokens: Set<string>,
  keywords: string[],
  aiMatches?: AiScoringEnhancement["contextualSkillMatches"]
): { score: number; matched: string[]; missing: string[] } {
  if (keywords.length === 0) return { score: 0.5, matched: [], missing: [] };

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    const kwTokens = tokenize(kw);
    const found = kwTokens.every(t => resumeTokens.has(t));
    
    if (found) {
      matched.push(kw);
    } else {
      // Check if AI found it contextually
      const aiFound = aiMatches?.some(m => 
        m.skill.toLowerCase().includes(kw.toLowerCase()) && m.relevanceScore > 60
      );
      if (aiFound) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
  }

  // Weighted: first keywords matter more
  let weightedScore = 0;
  let weightTotal = 0;
  for (let i = 0; i < keywords.length; i++) {
    const weight = Math.max(1, 2.5 - i * 0.05);
    weightTotal += weight;
    if (matched.includes(keywords[i])) {
      weightedScore += weight;
    }
  }

  return {
    score: Math.min(1, weightedScore / weightTotal),
    matched,
    missing,
  };
}

function skillsCoverageScore(
  resumeSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[],
  aiMatches?: AiScoringEnhancement["contextualSkillMatches"]
): { score: number; matchedRequired: string[]; missingRequired: string[] } {
  const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  for (const skill of requiredSkills) {
    const skillLower = skill.toLowerCase();
    const directMatch = resumeSkillsLower.has(skillLower) || 
                       Array.from(resumeSkillsLower).some(rs => 
                         rs.includes(skillLower) || skillLower.includes(rs)
                       );
    
    const aiMatch = aiMatches?.some(m => 
      m.skill.toLowerCase() === skillLower && m.relevanceScore > 50
    );

    if (directMatch || aiMatch) {
      matchedRequired.push(skill);
    } else {
      missingRequired.push(skill);
    }
  }

  const reqScore = requiredSkills.length > 0
    ? matchedRequired.length / requiredSkills.length
    : 0.5;

  return { score: reqScore, matchedRequired, missingRequired };
}

function experienceRelevanceScore(
  normalizedResume: NormalizedResume,
  industryContext: IndustryContext,
  aiAnalysis?: AiScoringEnhancement
): number {
  let score = 0;

  // Years match
  if (industryContext.yearsRequired !== null) {
    const yearsHave = normalizedResume.totalExperienceMonths / 12;
    if (yearsHave >= industryContext.yearsRequired) score += 0.3;
    else if (yearsHave >= industryContext.yearsRequired * 0.7) score += 0.2;
    else score += 0.1;
  } else {
    score += 0.2;
  }

  // Seniority alignment
  const resumeSeniority = detectResumeSeniority(normalizedResume);
  const seniorityOrder = ["intern", "junior", "mid", "senior", "manager", "executive"];
  const resumeIdx = seniorityOrder.indexOf(resumeSeniority);
  const jdIdx = seniorityOrder.indexOf(industryContext.seniorityLevel);
  const diff = Math.abs(resumeIdx - jdIdx);
  if (diff === 0) score += 0.3;
  else if (diff === 1) score += 0.2;
  else score += 0.1;

  // AI-enhanced relevance
  if (aiAnalysis?.adjustedBreakdown?.experienceRelevance) {
    score += aiAnalysis.adjustedBreakdown.experienceRelevance * 0.4;
  } else {
    score += 0.2;
  }

  return Math.min(1, score);
}

function detectResumeSeniority(normalizedResume: NormalizedResume): string {
  const years = normalizedResume.totalExperienceMonths / 12;
  const titles = normalizedResume.experienceTitles.map(t => t.toLowerCase()).join(" ");

  for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS)) {
    if (keywords.some(k => titles.includes(k))) return level;
  }

  if (years >= 15) return "executive";
  if (years >= 10) return "manager";
  if (years >= 6) return "senior";
  if (years >= 3) return "mid";
  if (years >= 1) return "junior";
  return "intern";
}

function bulletImpactScore(bullets: string[]): number {
  if (bullets.length === 0) return 0;
  let totalScore = 0;

  for (const b of bullets) {
    let bulletScore = 0;
    const words = b.trim().split(/\s+/);
    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";

    // Action verb (0-0.35)
    if (ACTION_VERBS_TIER1.has(firstWord)) bulletScore += 0.35;
    else if (ACTION_VERBS_TIER2.has(firstWord)) bulletScore += 0.25;
    else if (ACTION_VERBS_TIER3.has(firstWord)) bulletScore += 0.15;
    else if (WEAK_VERBS.has(firstWord)) bulletScore += 0;
    else bulletScore += 0.05;

    // Quantification (0-0.35)
    const hasPercent = /%/.test(b);
    const hasDollar = /\$\d+/.test(b);
    const hasNumber = /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/.test(b);
    const hasMetric = /\b(?:increased|decreased|reduced|improved|grew|saved|generated)\b.*\b\d+/i.test(b);

    if ((hasPercent || hasDollar) && hasMetric) bulletScore += 0.35;
    else if (hasPercent || hasDollar) bulletScore += 0.25;
    else if (hasNumber && hasMetric) bulletScore += 0.20;
    else if (hasNumber) bulletScore += 0.10;

    // Length (0-0.15)
    if (words.length >= 10 && words.length <= 25) bulletScore += 0.15;
    else if (words.length >= 5 && words.length <= 30) bulletScore += 0.10;
    else bulletScore += 0.03;

    // Impact language (0-0.10)
    if (/\b(?:resulting in|leading to|which led|enabling|contributing to)\b/i.test(b)) {
      bulletScore += 0.10;
    }

    // No buzzwords (0-0.05)
    const hasBuzzword = [...BUZZWORDS_PENALTY].some(bw => b.toLowerCase().includes(bw));
    bulletScore += hasBuzzword ? 0 : 0.05;

    totalScore += Math.min(1, bulletScore);
  }

  return totalScore / bullets.length;
}

function formattingScore(resume: ResumeData, normalizedResume: NormalizedResume): number {
  let score = 0;
  let checks = 0;

  // Contact (2 points)
  const contactFields = [
    resume.personalInfo?.fullName,
    resume.personalInfo?.email,
    resume.personalInfo?.phone,
    resume.personalInfo?.location,
  ];
  score += (contactFields.filter(Boolean).length / contactFields.length) * 2;
  checks += 2;

  // Email format
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personalInfo?.email || "")) score += 0.5;
  checks += 0.5;

  // Sections exist (3 points)
  if ((resume.experience || []).length > 0) score += 1;
  if ((resume.education || []).length > 0) score += 1;
  if (normalizedResume.skills.length > 0) score += 1;
  checks += 3;

  // Summary (1 point)
  if (normalizedResume.hasSummary) score += 1;
  checks += 1;

  // Word count (1 point)
  if (normalizedResume.wordCount >= 250 && normalizedResume.wordCount <= 1000) score += 1;
  else if (normalizedResume.wordCount >= 150) score += 0.5;
  checks += 1;

  return score / checks;
}

function quantificationDensityScore(bullets: string[]): number {
  if (bullets.length === 0) return 0;
  
  const quantified = bullets.filter(b =>
    /\d+%/.test(b) ||
    /\$\d+/.test(b) ||
    /\b\d+[xX]\b/.test(b) ||
    /\b\d+\s*(?:million|billion|thousand|k|m|b)\b/i.test(b) ||
    /\b(?:increased|decreased|reduced|improved|grew)\b.*\d+/i.test(b)
  );

  const ratio = quantified.length / bullets.length;
  if (ratio >= 0.6) return 1.0;
  if (ratio >= 0.4) return 0.8;
  if (ratio >= 0.25) return 0.6;
  return ratio * 2; // Scale up low ratios
}

function readabilityClarityScore(bullets: string[], aiAnalysis?: AiScoringEnhancement): number {
  if (bullets.length === 0) return 0;
  let score = 0;

  // Average length
  const avgWords = bullets.reduce((sum, b) => sum + b.split(/\s+/).length, 0) / bullets.length;
  if (avgWords >= 10 && avgWords <= 22) score += 0.3;
  else if (avgWords >= 6 && avgWords <= 30) score += 0.2;
  else score += 0.1;

  // No overly long bullets
  const longBullets = bullets.filter(b => b.split(/\s+/).length > 35).length;
  score += Math.max(0, 0.2 - longBullets * 0.05);

  // No first person
  const firstPerson = bullets.filter(b => /\b(?:i|me|my)\b/i.test(b)).length;
  score += Math.max(0, 0.2 - firstPerson * 0.05);

  // Consistency
  const verbStarts = bullets.filter(b => {
    const first = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";
    return ACTION_VERBS_TIER1.has(first) || ACTION_VERBS_TIER2.has(first) || ACTION_VERBS_TIER3.has(first);
  }).length;
  const consistency = Math.max(verbStarts / bullets.length, 1 - verbStarts / bullets.length);
  score += consistency * 0.2;

  // AI tone analysis
  if (aiAnalysis?.toneAnalysis) {
    score += (aiAnalysis.toneAnalysis.professionalismScore / 100) * 0.1;
  }

  return Math.min(1, score);
}

function industryAlignmentScore(
  resumeTokens: Set<string>,
  industryContext: IndustryContext,
  aiAnalysis?: AiScoringEnhancement
): number {
  if (!industryContext.keywords.length) return 0.5;

  // Check for industry-specific keywords
  const industryKwFound = industryContext.keywords.filter(kw => {
    const tokens = tokenize(kw);
    return tokens.every(t => resumeTokens.has(t));
  });

  let score = industryKwFound.length / Math.min(industryContext.keywords.length, 15);

  // Boost from AI if it detected good alignment
  if (aiAnalysis?.adjustedBreakdown?.industryAlignment) {
    score = (score * 0.6) + (aiAnalysis.adjustedBreakdown.industryAlignment * 0.4);
  }

  return Math.min(1, score);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RED FLAGS
   ═══════════════════════════════════════════════════════════════════════════ */

function detectRedFlags(
  resume: ResumeData,
  normalizedResume: NormalizedResume,
  industryContext: IndustryContext,
  aiAnalysis?: AiScoringEnhancement
): RedFlag[] {
  const flags: RedFlag[] = [];

  // Critical: Missing contact
  if (!resume.personalInfo?.email) {
    flags.push({
      severity: "critical",
      issue: "Missing email address",
      fix: "Add a professional email to your contact information",
      section: "Contact",
    });
  }
  if (!resume.personalInfo?.phone) {
    flags.push({
      severity: "critical",
      issue: "Missing phone number",
      fix: "Add your phone number",
      section: "Contact",
    });
  }

  // Critical: No experience
  if ((resume.experience || []).length === 0) {
    flags.push({
      severity: "critical",
      issue: "No work experience listed",
      fix: "Add relevant work experience, internships, or volunteer roles",
      section: "Experience",
    });
  }

  // Critical gaps from AI
  if (aiAnalysis?.criticalGaps && aiAnalysis.criticalGaps.length > 0) {
    for (const gap of aiAnalysis.criticalGaps.slice(0, 3)) {
      flags.push({
        severity: "critical",
        issue: `Missing critical requirement: ${gap}`,
        fix: `Add this to your resume if you have this qualification, or consider if this role is the right fit`,
        section: "Skills/Experience",
      });
    }
  }

  // Warning: Few bullets
  if (normalizedResume.bullets.length < 3 && (resume.experience || []).length > 0) {
    flags.push({
      severity: "warning",
      issue: "Too few bullet points",
      fix: "Add 3-5 bullet points per role describing your achievements",
      section: "Experience",
    });
  }

  // Warning: Weak verbs
  const weakStarters = normalizedResume.bullets.filter(b => {
    const first = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";
    return WEAK_VERBS.has(first);
  });
  if (weakStarters.length > 0) {
    flags.push({
      severity: "warning",
      issue: `${weakStarters.length} bullet(s) use weak language`,
      fix: "Start bullets with strong action verbs like Led, Built, Delivered, Increased",
      section: "Experience",
    });
  }

  // Warning: Tone issues from AI
  if (aiAnalysis?.toneAnalysis && !aiAnalysis.toneAnalysis.industryAppropriate) {
    flags.push({
      severity: "warning",
      issue: `Language/tone not appropriate for ${industryContext.industry}`,
      fix: aiAnalysis.toneAnalysis.issues.join("; "),
      section: "General",
    });
  }

  // Info: No quantification
  const quantified = normalizedResume.bullets.filter(b => /\d/.test(b));
  if (quantified.length === 0 && normalizedResume.bullets.length > 0) {
    flags.push({
      severity: "warning",
      issue: "No quantified achievements",
      fix: "Add numbers, percentages, dollar amounts to show measurable impact",
      section: "Experience",
    });
  }

  return flags;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN SCORING FUNCTION
   ═══════════════════════════════════════════════════════════════════════════ */

export async function scoreResumeForAts(
  resume: ResumeData,
  jobDescription: string,
  useAI: boolean = true
): Promise<AtsResult> {
  const industryContext = useAI
    ? await detectIndustryAndContext(jobDescription)
    : fallbackIndustryDetection(jobDescription);
  
  // Step 2: Normalize resume
  const normalizedResume = normalizeResume(resume);
  const resumeTokens = new Set(tokenize(normalizedResume.fullText));

  // Step 3: AI-enhanced resume analysis (parallel with scoring)
  let aiEnhancement: AiScoringEnhancement | null = null;
  if (useAI) {
    aiEnhancement = await aiEnhancedResumeAnalysis(resume, industryContext);
  }

  // Step 4: Run scoring modules (AI-enhanced where available)
  const kwResult = keywordMatchScore(
    resumeTokens,
    industryContext.keywords,
    aiEnhancement?.contextualSkillMatches
  );

  const scResult = skillsCoverageScore(
    normalizedResume.skills,
    industryContext.requiredSkills,
    industryContext.preferredSkills,
    aiEnhancement?.contextualSkillMatches
  );

  const er = experienceRelevanceScore(normalizedResume, industryContext, aiEnhancement || undefined);
  const bi = bulletImpactScore(normalizedResume.bullets);
  const fm = formattingScore(resume, normalizedResume);
  const qd = quantificationDensityScore(normalizedResume.bullets);
  const rc = readabilityClarityScore(normalizedResume.bullets, aiEnhancement || undefined);
  const ia = industryAlignmentScore(resumeTokens, industryContext, aiEnhancement || undefined);
  const ac = 0.8; // Simplified ATS compatibility (structured data is inherently good)

  // Apply AI adjustments if available
  let finalKw = kwResult.score;
  let finalSc = scResult.score;
  let finalEr = er;
  let finalIa = ia;

  if (aiEnhancement?.adjustedBreakdown) {
    if (aiEnhancement.adjustedBreakdown.keywordMatch !== undefined) {
      finalKw = (finalKw * 0.4) + (aiEnhancement.adjustedBreakdown.keywordMatch * 0.6);
    }
    if (aiEnhancement.adjustedBreakdown.skillsCoverage !== undefined) {
      finalSc = (finalSc * 0.4) + (aiEnhancement.adjustedBreakdown.skillsCoverage * 0.6);
    }
    if (aiEnhancement.adjustedBreakdown.experienceRelevance !== undefined) {
      finalEr = (finalEr * 0.3) + (aiEnhancement.adjustedBreakdown.experienceRelevance * 0.7);
    }
    if (aiEnhancement.adjustedBreakdown.industryAlignment !== undefined) {
      finalIa = (finalIa * 0.3) + (aiEnhancement.adjustedBreakdown.industryAlignment * 0.7);
    }
  }

  const breakdown: AtsBreakdown = {
    keywordMatch: finalKw,
    skillsCoverage: finalSc,
    experienceRelevance: finalEr,
    bulletImpact: bi,
    formatting: fm,
    sectionCompleteness: 0.8, // Simplified
    quantificationDensity: qd,
    readabilityClarity: rc,
    relevancyAlignment: (finalKw + finalSc + finalEr) / 3,
    atsCompatibility: ac,
    industryAlignment: finalIa,
  };

  // Weighted score
  const weights = {
    keywordMatch: 0.18,
    skillsCoverage: 0.16,
    experienceRelevance: 0.14,
    bulletImpact: 0.12,
    formatting: 0.05,
    sectionCompleteness: 0.05,
    quantificationDensity: 0.10,
    readabilityClarity: 0.05,
    relevancyAlignment: 0.05,
    atsCompatibility: 0.03,
    industryAlignment: 0.07,
  };

  const rawScore =
    breakdown.keywordMatch * weights.keywordMatch +
    breakdown.skillsCoverage * weights.skillsCoverage +
    breakdown.experienceRelevance * weights.experienceRelevance +
    breakdown.bulletImpact * weights.bulletImpact +
    breakdown.formatting * weights.formatting +
    breakdown.sectionCompleteness * weights.sectionCompleteness +
    breakdown.quantificationDensity * weights.quantificationDensity +
    breakdown.readabilityClarity * weights.readabilityClarity +
    breakdown.relevancyAlignment * weights.relevancyAlignment +
    breakdown.atsCompatibility * weights.atsCompatibility +
    breakdown.industryAlignment * weights.industryAlignment;

  let score = Math.round(rawScore * 100);

  // Apply red flag penalties
  const redFlags = detectRedFlags(resume, normalizedResume, industryContext, aiEnhancement || undefined);
  const criticalFlags = redFlags.filter(f => f.severity === "critical");
  if (criticalFlags.length >= 3) score = Math.min(score, 35);
  else if (criticalFlags.length === 2) score = Math.min(score, 50);
  else if (criticalFlags.length === 1) score = Math.min(score, 65);

  const grade = calculateGrade(score);

  // Generate suggestions
  const suggestions = generateSuggestions(
    breakdown,
    kwResult.missing,
    scResult.missingRequired,
    normalizedResume,
    industryContext,
    aiEnhancement
  );

  // Section scores (simplified)
  const sectionScores: SectionScore[] = [];

  return {
    score,
    grade,
    breakdown,
    keywords: industryContext.keywords,
    suggestions,
    matchedSkills: scResult.matchedRequired,
    missingSkills: scResult.missingRequired,
    matchedKeywords: kwResult.matched,
    missingKeywords: kwResult.missing,
    redFlags,
    sectionScores,
    detectedIndustry: aiEnhancement?.detectedIndustry || industryContext.industry,
    detectedRole: aiEnhancement?.detectedJobRole || industryContext.role,
    aiEnhancedScoring: aiEnhancement,
    aiAnalysis: null, // Will be filled by separate deep analysis call
  };
}

function calculateGrade(score: number): string {
  if (score >= 93) return "A+";
  if (score >= 85) return "A";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  if (score >= 63) return "C+";
  if (score >= 55) return "C";
  if (score >= 45) return "D";
  return "F";
}

function generateSuggestions(
  breakdown: AtsBreakdown,
  missingKeywords: string[],
  missingSkills: string[],
  normalizedResume: NormalizedResume,
  industryContext: IndustryContext,
  aiAnalysis?: AiScoringEnhancement | null
): AtsSuggestion[] {
  const suggestions: AtsSuggestion[] = [];

  // AI-powered suggestions first
  if (aiAnalysis?.criticalGaps && aiAnalysis.criticalGaps.length > 0) {
    suggestions.push({
      category: "critical",
      section: "Overall",
      message: `Missing ${aiAnalysis.criticalGaps.length} critical requirement(s) for this role`,
      actionItem: `Address these gaps: ${aiAnalysis.criticalGaps.slice(0, 3).join("; ")}`,
      impact: "Could increase score by 15-25 points",
    });
  }

  if (breakdown.keywordMatch < 0.5) {
    suggestions.push({
      category: "critical",
      section: "Content",
      message: `Only ${Math.round(breakdown.keywordMatch * 100)}% keyword match`,
      actionItem: `Naturally incorporate these ${industryContext.industry} terms: ${missingKeywords.slice(0, 6).join(", ")}`,
      impact: "+10-15 points",
    });
  }

  if (breakdown.skillsCoverage < 0.4) {
    suggestions.push({
      category: "critical",
      section: "Skills",
      message: "Major skills gap detected",
      actionItem: `Add these required skills if you have them: ${missingSkills.slice(0, 5).join(", ")}`,
      impact: "+8-12 points",
    });
  }

  if (breakdown.bulletImpact < 0.5) {
    suggestions.push({
      category: "high",
      section: "Experience",
      message: "Bullets lack measurable impact",
      actionItem: "Rewrite using: [Action Verb] + [What] + [Result with numbers]. Example: 'Increased customer retention by 23% through implementation of loyalty program'",
      impact: "+6-10 points",
    });
  }

  if (breakdown.quantificationDensity < 0.4) {
    suggestions.push({
      category: "high",
      section: "Experience",
      message: `Only ${Math.round(breakdown.quantificationDensity * 100)}% of bullets quantified`,
      actionItem: "Add metrics to at least 50% of bullets (%, $, time, people, customers)",
      impact: "+5-8 points",
    });
  }

  if (breakdown.industryAlignment < 0.5) {
    suggestions.push({
      category: "high",
      section: "Overall",
      message: `Resume doesn't reflect ${industryContext.industry} industry language`,
      actionItem: aiAnalysis?.industrySpecificKeywords?.length
        ? `Use more industry terms like: ${aiAnalysis.industrySpecificKeywords.slice(0, 4).join(", ")}`
        : `Research common terminology in ${industryContext.industry} and incorporate it`,
      impact: "+4-7 points",
    });
  }

  if (!normalizedResume.hasSummary) {
    suggestions.push({
      category: "medium",
      section: "Summary",
      message: "Missing professional summary",
      actionItem: `Write 2-3 sentences highlighting your ${industryContext.role} experience and key qualifications`,
      impact: "+3-5 points",
    });
  }

  // Sort by priority
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => order[a.category] - order[b.category]);

  return suggestions.slice(0, 8); // Top 8 suggestions
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEEP AI ANALYSIS
   ═══════════════════════════════════════════════════════════════════════════ */

export async function deepAtsAnalysis(
  resume: ResumeData,
  jobDescription: string,
  localResult?: AtsResult
): Promise<AiAtsAnalysis> {
  const contextInfo = localResult
    ? `
LOCAL ANALYSIS CONTEXT:
- Overall Score: ${localResult.score}/100 (${localResult.grade})
- Industry Detected: ${localResult.detectedIndustry}
- Role Detected: ${localResult.detectedRole}
- Keyword Match: ${Math.round(localResult.breakdown.keywordMatch * 100)}%
- Skills Coverage: ${Math.round(localResult.breakdown.skillsCoverage * 100)}%
- Missing Keywords: ${localResult.missingKeywords.slice(0, 8).join(", ")}
- Missing Skills: ${localResult.missingSkills.slice(0, 8).join(", ")}
- Red Flags: ${localResult.redFlags.length} (${localResult.redFlags.filter(f => f.severity === "critical").length} critical)
${localResult.aiEnhancedScoring ? `
AI ENHANCEMENT:
- Experience Quality: ${localResult.aiEnhancedScoring.experienceQualityScore}/100
- Hidden Strengths: ${localResult.aiEnhancedScoring.hiddenStrengths.join("; ")}
- Critical Gaps: ${localResult.aiEnhancedScoring.criticalGaps.join("; ")}
` : ""}
`
    : "";

  const prompt = `
You are an elite ATS analyst and career coach with 20+ years of experience across ALL industries.

${contextInfo}

RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Perform a comprehensive, brutally honest analysis. Be SPECIFIC - reference actual content, not generic advice.

Return JSON:
{
  "overallAssessment": "3-4 sentences. Be honest about fit. What are the biggest strengths and gaps?",
  "strengthAreas": ["5 specific strengths with evidence from resume"],
  "improvementAreas": ["5 specific weaknesses explaining why they matter for THIS role"],
  "keywordSuggestions": ["10 specific missing keywords from the JD that should be added"],
  "bulletRewrites": [
    {
      "original": "Exact quote from resume",
      "improved": "Dramatically improved version with STAR method and metrics",
      "reason": "Why the original was weak and how the new version is better"
    }
  ],
  "tailoredSummary": "A completely rewritten 3-4 sentence professional summary tailored to this exact job",
  "industryInsights": "2-3 sentences of industry-specific advice for success in this role",
  "competitiveScore": <0-100, be critical - average is 40-50, great is 70+>,
  "roleAlignmentAnalysis": "2-3 sentences on career trajectory fit",
  "seniorityMatch": "Does experience level match the role?",
  "cultureFitIndicators": ["3-4 signals about potential culture fit"],
  "dealBreakers": ["Absolute deal-breakers if any, else empty array"]
}

Rules:
- Be CRITICAL. Don't inflate scores.
- Pick 4-5 WEAKEST bullets to rewrite
- Only suggest keywords actually in the JD
- Never invent experience
- Be specific: quote exact text, give exact rewrites
Return ONLY valid JSON.`;

  try {
    const response = await callGrok(
      "You are a ruthlessly honest senior ATS analyst. Return only valid JSON.",
      prompt,
      true,
      0.4,
      8000,
      "ats_scoring"
    );
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    // Use the robust JSON parsing logic
    try {
      return JSON.parse(cleaned) as AiAtsAnalysis;
    } catch (e) {
      console.warn("[ats] Failed to parse Deep AI Analysis JSON directly, attempting recovery...");
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
         return JSON.parse(match[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")) as AiAtsAnalysis;
      }
      throw e;
    }
  } catch (error) {
    console.error("Deep AI analysis failed:", error);
    throw error;
  }
}
