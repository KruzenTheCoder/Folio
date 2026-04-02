'use client';

import { useState } from 'react';
import { useResumeAI } from '@/hooks/useResumeAI';

export default function OptimizePage() {
  const [resume, setResume] = useState('');
  const [job, setJob] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const { optimizeResume, loading, progress, error } = useResumeAI();

  const handleOptimize = async () => {
    const data = await optimizeResume(resume, job);
    setResult(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Optimize Resume</h1>
      
      <textarea
        placeholder="Paste your resume..."
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        className="w-full h-40 p-4 border rounded mb-4"
      />
      
      <textarea
        placeholder="Paste job description..."
        value={job}
        onChange={(e) => setJob(e.target.value)}
        className="w-full h-40 p-4 border rounded mb-4"
      />
      
      <button
        onClick={handleOptimize}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? progress : 'Optimize Resume'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Results</h2>
          <p className="text-sm text-gray-600">Industry: {result.industry}</p>
          
          <div className="mt-4">
            <h3 className="font-bold">Analysis Score: {result.analysis.overallScore}/100</h3>
            <p>{result.analysis.summary}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold">Improvements:</h3>
            <ul className="list-disc pl-6">
              {result.improvements.map((imp: string, i: number) => (
                <li key={i}>{imp}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-bold">Optimized Resume:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(result.optimizedResume, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
