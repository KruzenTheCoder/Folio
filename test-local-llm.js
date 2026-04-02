import { callLLM } from './src/lib/llm.js';

async function runTest() {
  console.log("Testing local LLM connection...");
  try {
    const startTime = Date.now();
    const result = await callLLM([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Reply with the exact word: SUCCESS" }
    ], {
      timeoutMs: 15000,
      maxTokens: 50,
      temperature: 0.1
    });
    const elapsed = Date.now() - startTime;
    console.log(`\n✅ LLM Responded in ${elapsed}ms:`);
    console.log(result);
  } catch (error) {
    console.error("\n❌ LLM Test Failed:");
    console.error(error);
  }
}

runTest();
