export const KNOWLEDGE = {
  ats: `
- Use action verbs (Led, Built, Optimized)
- Include metrics (%, $, time saved)
- Match job keywords exactly
- Avoid generic phrases
`,
  examples: `
Bad:
- Responsible for managing systems

Good:
- Managed backend systems, improving performance by 35%
`,
};

export function extractKeywords(job: string): string[] {
  const words = job.match(/\b[\w-]+\b/g) || [];
  const stop = new Set([
    "about",
    "after",
    "before",
    "being",
    "could",
    "should",
    "would", 
    "there",
    "their",
    "while",
    "where",
    "which",
    "with",
    "your",
    "ours",
    "ourselves",
    "from",
    "that",
    "this",
    "have",
    "has",
    "will",
    "must",
    "into",
    "across",
    "through",
    "using",
    "used",
    "able",
    "team",
    "work",
    "years",
    "year",
  ]);
  const uniq = Array.from(
    new Set(
      words
        .map((w) => w.toLowerCase())
        .filter((w) => w.length > 4 && !stop.has(w))
    )
  );
  return uniq.slice(0, 15);
}
