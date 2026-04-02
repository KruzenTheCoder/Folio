import { useState } from 'react';

interface OptimizeResult {
  industry: string;
  keywords: any;
  analysis: any;
  optimizedResume: any;
  improvements: string[];
}

export function useResumeAI() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const optimizeResume = async (
    resumeText: string,
    jobDescription: string
  ): Promise<OptimizeResult | null> => {
    setLoading(true);
    setError(null);
    setProgress('Starting optimization...');

    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Optimization failed');
      }

      const result = await response.json();
      setProgress('Complete!');
      return result;
      
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateResume = async (
    jobTitle: string,
    jobDescription: string,
    userContext: any
  ) => {
    setLoading(true);
    setError(null);
    setProgress('Generating resume...');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, jobDescription, userContext }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const result = await response.json();
      setProgress('Complete!');
      return result;
      
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const optimizeWithStream = async (
    resumeText: string,
    jobDescription: string,
    onProgress: (step: string, data?: any) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/optimize-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.error) {
              throw new Error(data.error);
            }
            onProgress(data.step, data.data);
            setProgress(data.step);
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCoverLetter = async (
    resumeText: string,
    jobDescription: string
  ) => {
    setLoading(true);
    setError(null);
    setProgress('Generating Cover Letter...');

    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!response.ok) {
        throw new Error('Cover letter generation failed');
      }

      const result = await response.json();
      setProgress('Complete!');
      return result;
      
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createInterviewPrep = async (
    resumeText: string,
    jobDescription: string
  ) => {
    setLoading(true);
    setError(null);
    setProgress('Generating Interview Prep...');

    try {
      const response = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!response.ok) {
        throw new Error('Interview prep generation failed');
      }

      const result = await response.json();
      setProgress('Complete!');
      return result;
      
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    optimizeResume,
    generateResume,
    optimizeWithStream,
    createCoverLetter,
    createInterviewPrep,
    loading,
    progress,
    error,
  };
}
