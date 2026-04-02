/**
 * AI API Integration Test
 * Tests: Groq connection, resume parsing, bullet enhancement, ATS scoring
 * Run: node test-ai.mjs
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg, err) => console.log(`  ❌ ${msg}`, err?.message || err || "");
const info = (msg) => console.log(`  ℹ️  ${msg}`);
const divider = () => console.log("─".repeat(60));

async function callGroq(system, user, json = false) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: json ? { type: "json_object" } : undefined,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  return res;
}

// ── Test 1: API Key & Connection ──
async function testConnection() {
  console.log("\n🔑 TEST 1: Groq API Connection");
  divider();

  if (!API_KEY) {
    fail("No API key found. Set GROQ_API_KEY in .env.local");
    return false;
  }
  info(`Key found: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
  info(`Model: ${MODEL}`);

  try {
    const res = await callGroq("Reply with exactly: OK", "Ping");
    if (res.ok) {
      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      pass(`Connected! Response: "${content?.trim().slice(0, 50)}"`);
      return true;
    } else {
      const body = await res.text();
      fail(`HTTP ${res.status}`, body.slice(0, 200));
      return false;
    }
  } catch (err) {
    fail("Network error", err);
    return false;
  }
}

// ── Test 2: Resume Parsing (JSON mode) ──
async function testParsing() {
  console.log("\n📄 TEST 2: Resume Parsing (JSON mode)");
  divider();

  const sampleResume = `
John Doe
Software Engineer | john@email.com | (555) 123-4567 | San Francisco, CA

EXPERIENCE
Senior Developer at TechCorp (2021 - Present)
- Built microservices handling 10M requests/day
- Led team of 5 engineers

EDUCATION
B.S. Computer Science, Stanford University, 2020

SKILLS: JavaScript, Python, React, Node.js, AWS
  `.trim();

  try {
    const res = await callGroq(
      "You are a resume parser. Return valid JSON with fields: name, email, phone, experience (array), skills (array).",
      `Parse this resume:\n${sampleResume}`,
      true
    );

    if (!res.ok) {
      const body = await res.text();
      fail(`HTTP ${res.status}`, body.slice(0, 200));
      return;
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;

    if (!content) {
      fail("Empty response from Groq");
      return;
    }

    const parsed = JSON.parse(content);
    pass("JSON parse successful");
    
    if (parsed.name) pass(`Name extracted: "${parsed.name}"`);
    else fail("Missing name field");

    if (parsed.email) pass(`Email extracted: "${parsed.email}"`);
    else fail("Missing email field");

    const skills = parsed.skills || [];
    if (skills.length > 0) pass(`Skills extracted: ${skills.length} items → ${skills.slice(0, 5).join(", ")}`);
    else fail("No skills extracted");

    const exp = parsed.experience || [];
    if (exp.length > 0) pass(`Experience entries: ${exp.length}`);
    else fail("No experience extracted");

  } catch (err) {
    fail("Parsing test failed", err);
  }
}

// ── Test 3: Bullet Enhancement ──
async function testBulletEnhancement() {
  console.log("\n💡 TEST 3: Bullet Enhancement");
  divider();

  try {
    const res = await callGroq(
      "You are a resume bullet enhancer. Return a JSON object with: original, enhanced, reasoning.",
      `Enhance this resume bullet for a Senior Developer role: "Worked on backend services"`,
      true
    );

    if (!res.ok) {
      fail(`HTTP ${res.status}`);
      return;
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    if (parsed.enhanced) {
      pass(`Original:  "Worked on backend services"`);
      pass(`Enhanced:  "${parsed.enhanced}"`);
      if (parsed.reasoning) info(`Reasoning: ${parsed.reasoning.slice(0, 100)}`);
    } else {
      fail("No enhanced bullet returned");
    }
  } catch (err) {
    fail("Bullet enhancement failed", err);
  }
}

// ── Test 4: ATS Keyword Analysis ──
async function testAtsAnalysis() {
  console.log("\n🎯 TEST 4: ATS Keyword Analysis");
  divider();

  try {
    const res = await callGroq(
      "You are an ATS scoring engine. Return JSON with: score (0-100), matchedKeywords (array), missingKeywords (array), suggestions (array of strings).",
      `Score this resume against the job description.
RESUME SKILLS: JavaScript, React, Node.js, Python, AWS
JOB DESCRIPTION: Looking for a Full Stack Engineer with experience in TypeScript, React, Node.js, Docker, Kubernetes, CI/CD, and AWS.`,
      true
    );

    if (!res.ok) {
      fail(`HTTP ${res.status}`);
      return;
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    if (typeof parsed.score === "number") {
      pass(`ATS Score: ${parsed.score}/100`);
    } else {
      fail("No score returned");
    }

    const matched = parsed.matchedKeywords || parsed.matched_keywords || [];
    const missing = parsed.missingKeywords || parsed.missing_keywords || [];

    if (matched.length > 0) pass(`Matched: ${matched.join(", ")}`);
    if (missing.length > 0) info(`Missing: ${missing.join(", ")}`);

    const suggestions = parsed.suggestions || [];
    if (suggestions.length > 0) {
      info(`Suggestions (${suggestions.length}):`);
      suggestions.slice(0, 3).forEach((s) => info(`  → ${s}`));
    }
  } catch (err) {
    fail("ATS analysis failed", err);
  }
}

// ── Test 5: Response Latency ──
async function testLatency() {
  console.log("\n⏱️  TEST 5: Response Latency");
  divider();

  try {
    const start = Date.now();
    const res = await callGroq("Reply with: OK", "Ping");
    const elapsed = Date.now() - start;

    if (res.ok) {
      if (elapsed < 2000) pass(`Latency: ${elapsed}ms (excellent)`);
      else if (elapsed < 5000) pass(`Latency: ${elapsed}ms (acceptable)`);
      else info(`Latency: ${elapsed}ms (slow — may cause timeouts)`);
    } else {
      fail(`HTTP ${res.status} in ${elapsed}ms`);
    }
  } catch (err) {
    fail("Latency test failed", err);
  }
}

// ── Run All ──
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║           🧪 AI API Integration Test Suite              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  const connected = await testConnection();
  if (!connected) {
    console.log("\n🛑 Cannot proceed — fix API key/connection first.\n");
    process.exit(1);
  }

  await testParsing();
  await testBulletEnhancement();
  await testAtsAnalysis();
  await testLatency();

  console.log("\n" + "═".repeat(60));
  console.log("🏁 All tests complete!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
