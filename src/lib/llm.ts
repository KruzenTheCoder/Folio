export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  asJson?: boolean;
  stream?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
}

const DEFAULT_TIMEOUT_MS = 60000;
const OLLAMA_ENDPOINT = process.env.LOCAL_LLM_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = "gpt-oss:120b-cloud";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const FALLBACK_JSON = JSON.stringify({
  extractedData: { personalInfo: {}, experience: [], education: [], skills: [] },
  score: 0,
  feedback: [],
  suggestions: [],
  metrics: [],
  reasoning: "Fallback response due to timeout or error",
  industry: "General",
  subIndustry: "",
  keyTerminology: [],
  essentialSkills: [],
  preferredCertifications: [],
  commonMetrics: [],
  toneGuidance: "Neutral",
  changes: [],
  improvedData: {}
});

export async function callLLM(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const {
    temperature = 0.4,
    maxTokens = 1500,
    asJson = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = 2,
  } = options;

  const isLocal = (process.env.AI_PROVIDER || "").toLowerCase() === "local" || process.env.LOCAL_LLM === "true";
  const groqApiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  const useGroq = !isLocal && !!groqApiKey;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const endpoint = useGroq ? GROQ_API_URL : OLLAMA_ENDPOINT;
    console.info(`[llm] Starting request to ${endpoint} (Attempt ${attempt}/${maxRetries + 1}) with timeout: ${timeoutMs}ms`);

    try {
      let response;
      if (useGroq) {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages,
            stream: false,
            temperature,
            max_tokens: maxTokens,
            response_format: asJson ? { type: "json_object" } : undefined,
          }),
          signal: controller.signal,
        });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
            options: {
              temperature,
              num_predict: maxTokens,
            },
            format: asJson ? 'json' : undefined,
          }),
          signal: controller.signal,
        });
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      let content = "";
      if (useGroq) {
        if (!data.choices?.[0]?.message?.content) {
          throw new Error("No response from Groq");
        }
        content = data.choices[0].message.content;
      } else {
        if (!data.message?.content) {
          throw new Error("No response from Ollama");
        }
        content = data.message.content;
      }

      // Validate and recover JSON if requested
      if (asJson) {
        try {
          JSON.parse(content);
        } catch (e) {
          console.warn(`[llm] Initial JSON parse failed on attempt ${attempt}, attempting recovery...`);
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            content = jsonMatch[0]
              .replace(/,\s*}/g, "}") // Remove trailing commas in objects
              .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
              .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Quote unquoted keys
            
            try {
              JSON.parse(content); // Validate the recovered string
            } catch {
              throw new Error("JSON recovery failed");
            }
          } else {
            throw new Error("No JSON structure found in response");
          }
        }
      }

      clearTimeout(timer);
      return content;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      
      if (attempt <= maxRetries) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.warn(`[llm] Attempt ${attempt} failed: ${errorMessage}. Retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // If we exhaust all retries
  if (lastError instanceof Error && lastError.name === "AbortError") {
    console.warn("[llm] Timeout exceeded after all retries, returning fallback");
    return asJson ? FALLBACK_JSON : "I'm currently experiencing high latency. Please try again.";
  }
  
  console.error("[llm] callLLM failed after all retries:", lastError);
  return asJson ? FALLBACK_JSON : "I encountered an error. Please try again.";
}

export async function callLLMStream(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<ReadableStream> {
  const {
    temperature = 0.4,
    maxTokens = 1500,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  // For streaming, timeout applies to time-to-first-byte or we can remove it.
  // We'll apply it just for the initial connection.
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  console.info(`[llm] Starting stream request to ${OLLAMA_ENDPOINT} with timeout: ${timeoutMs}ms`);

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: true,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return response.body;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}
