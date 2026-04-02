import { detectIndustry, Industry } from './industry-detector';
import { 
  getAnalysisPrompt, 
  getRewritePrompt, 
  getPolishPrompt,
  getKeywordExtractionPrompt,
  getGeneratePrompt,
  getCoverLetterPrompt,
  getInterviewPrepPrompt
} from './prompts';

interface PipelineConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

const DEFAULT_CONFIG: PipelineConfig = {
  model: 'llama3',
  temperature: 0.7,
  maxTokens: 8000,
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
};

const llmCache = new Map<string, any>();

// Core LLM caller highly optimized for local Ollama
async function callLLM(
  prompt: string, 
  config: PipelineConfig = DEFAULT_CONFIG,
  expectJSON: boolean = true
): Promise<any> {
  // 1. Caching
  const cacheKey = `${config.model}:${expectJSON}:${prompt}`;
  if (llmCache.has(cacheKey)) {
    return llmCache.get(cacheKey);
  }

  const baseUrl = config.baseUrl || DEFAULT_CONFIG.baseUrl;
  const modelUrl = `${baseUrl}/api/chat`;
  
  // 2. Allow sufficient time for cloud models (60s)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model || DEFAULT_CONFIG.model!,
        messages: [
          {
            role: 'system',
            content: expectJSON 
              ? 'You are an ATS optimization engine. Output ONLY valid JSON. No explanations.'
              : 'You are an ATS optimization engine. Output concisely.'
          },
          { role: 'user', content: prompt }
        ],
        stream: false,
        options: {
          temperature: config.temperature || DEFAULT_CONFIG.temperature,
          num_predict: config.maxTokens || DEFAULT_CONFIG.maxTokens,
        },
        format: expectJSON ? 'json' : undefined
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content || '';
    
    let result = content;
    
    if (expectJSON) {
      // Safely extract and parse JSON payload
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      
      result = JSON.parse(jsonStr.trim());
    }

    // Cache to prevent duplicate computations
    llmCache.set(cacheKey, result);
    return result;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('LLM request timed out after 3 seconds.');
    }
    throw error;
  }
}

// STEP 1: Extract keywords from job description
export async function extractKeywords(jobDescription: string) {
  try {
    const result = await callLLM(getKeywordExtractionPrompt(jobDescription), DEFAULT_CONFIG, true);
    return result;
  } catch (error) {
    console.error('Keyword extraction failed:', error);
    // Fallback: simple extraction
    const words = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
    const filtered = words.filter(w => w.length > 4);
    const unique = [...new Set(filtered)];
    
    return {
      required_skills: unique.slice(0, 10),
      preferred_skills: [],
      key_responsibilities: [],
      important_keywords: unique.slice(0, 15),
      experience_level: 'Mid',
      industry_terms: []
    };
  }
}

// STEP 2: Analyze resume
export async function analyzeResume(resumeText: string, industry: Industry) {
  try {
    const analysis = await callLLM(getAnalysisPrompt(resumeText, industry), DEFAULT_CONFIG, true);
    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    return {
      weakPoints: [],
      missingMetrics: [],
      genericPhrases: [],
      missingKeywords: [],
      overallScore: 50,
      summary: 'Analysis unavailable'
    };
  }
}

// STEP 3: Rewrite resume
export async function rewriteResume(
  resumeText: string,
  jobDescription: string,
  industry: Industry,
  analysisResults: any
) {
  try {
    const rewritten = await callLLM(
      getRewritePrompt(resumeText, jobDescription, industry, analysisResults),
      { ...DEFAULT_CONFIG, maxTokens: 12000 },
      true
    );
    return rewritten;
  } catch (error) {
    console.error('Rewrite failed:', error);
    throw error;
  }
}

// STEP 4: Polish content
export async function polishContent(content: string, industry: Industry) {
  try {
    const polished = await callLLM(
      getPolishPrompt(content, industry),
      DEFAULT_CONFIG,
      false
    );
    return polished;
  } catch (error) {
    console.error('Polish failed:', error);
    return content; // Return original if polish fails
  }
}

// STEP 5: Generate resume from scratch
export async function generateResume(jobTitle: string, industry: Industry, context: any) {
  try {
    const generated = await callLLM(
      getGeneratePrompt(jobTitle, industry, context),
      { ...DEFAULT_CONFIG, maxTokens: 10000 },
      true
    );
    return generated;
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
}

// 🔥 MAIN PIPELINE: Full resume optimization
export async function runFullPipeline(
  resumeText: string,
  jobDescription: string,
  onProgress?: (step: string, data?: any) => void
) {
  try {
    // Step 1: Detect industry
    onProgress?.('Detecting industry...');
    const industry = detectIndustry(jobDescription, resumeText);
    onProgress?.('industry_detected', { industry });
    
    // Step 2: Extract keywords
    onProgress?.('Extracting keywords...');
    const keywords = await extractKeywords(jobDescription);
    onProgress?.('keywords_extracted', keywords);
    
    // Step 3: Analyze resume
    onProgress?.('Analyzing resume...');
    const analysis = await analyzeResume(resumeText, industry);
    onProgress?.('analysis_complete', analysis);
    
    // Step 4: Rewrite resume
    onProgress?.('Optimizing resume...');
    const rewritten = await rewriteResume(resumeText, jobDescription, industry, analysis);
    onProgress?.('rewrite_complete', rewritten);
    
    // Step 5: Final polish
    onProgress?.('Final polish...');
    const polished = await polishContent(JSON.stringify(rewritten), industry);
    onProgress?.('polish_complete', { polished });
    
    return {
      industry,
      keywords,
      analysis,
      optimizedResume: rewritten,
      finalVersion: polished,
      improvements: rewritten.keyImprovements || []
    };
    
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}

// 🚀 QUICK PIPELINE: Generate resume from scratch
export async function runGenerationPipeline(
  jobTitle: string,
  jobDescription: string,
  userContext: any,
  onProgress?: (step: string, data?: any) => void
) {
  try {
    // Step 1: Detect industry
    onProgress?.('Detecting industry...');
    const industry = detectIndustry(jobDescription);
    onProgress?.('industry_detected', { industry });
    
    // Step 2: Extract keywords
    onProgress?.('Analyzing job requirements...');
    const keywords = await extractKeywords(jobDescription);
    onProgress?.('keywords_extracted', keywords);
    
    // Step 3: Generate resume
    onProgress?.('Generating resume...');
    const generated = await generateResume(jobTitle, industry, {
      ...userContext,
      keywords: keywords.important_keywords,
      requiredSkills: keywords.required_skills
    });
    onProgress?.('generation_complete', generated);
    
    // Step 4: Polish
    onProgress?.('Polishing...');
    const polished = await polishContent(JSON.stringify(generated), industry);
    onProgress?.('polish_complete', { polished });
    
    return {
      industry,
      keywords,
      generatedResume: generated,
      finalVersion: polished
    };
    
  } catch (error) {
    console.error('Generation pipeline failed:', error);
    throw error;
  }
}

// 📝 STEP 6: Generate Cover Letter
export async function generateCoverLetter(resumeText: string, jobDescription: string, industry: Industry) {
  try {
    const result = await callLLM(
      getCoverLetterPrompt(resumeText, jobDescription, industry),
      { ...DEFAULT_CONFIG, maxTokens: 4000 },
      true
    );
    return result;
  } catch (error) {
    console.error('Cover letter generation failed:', error);
    throw error;
  }
}

// 🎤 STEP 7: Generate Interview Prep
export async function generateInterviewPrep(resumeText: string, jobDescription: string, industry: Industry) {
  try {
    const result = await callLLM(
      getInterviewPrepPrompt(resumeText, jobDescription, industry),
      { ...DEFAULT_CONFIG, maxTokens: 6000 },
      true
    );
    return result;
  } catch (error) {
    console.error('Interview prep generation failed:', error);
    throw error;
  }
}
