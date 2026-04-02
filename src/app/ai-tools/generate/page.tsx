'use client';

import { useState } from 'react';
import { useResumeAI } from '@/hooks/useResumeAI';

export default function GeneratePage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const { generateResume, loading, progress, error } = useResumeAI();

  const handleGenerate = async () => {
    const data = await generateResume(jobTitle, jobDesc, {
      experienceLevel: 'Senior',
      yearsExperience: 5,
    });
    setResult(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Generate Resume</h1>
      
      <input
        placeholder="Job Title (e.g., Senior Software Engineer)"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="w-full p-4 border rounded mb-4"
      />
      
      <textarea
        placeholder="Paste job description..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        className="w-full h-40 p-4 border rounded mb-4"
      />
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        {loading ? progress : 'Generate Resume'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Generated Resume</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm mt-4 overflow-auto max-h-96">
            {JSON.stringify(result.generatedResume, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
