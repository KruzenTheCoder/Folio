import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai/pipeline';
import { detectIndustry } from '@/lib/ai/industry-detector';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();
    
    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const industry = detectIndustry(jobDescription, resumeText);
    const result = await generateCoverLetter(resumeText, jobDescription, industry);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Cover letter generation failed' },
      { status: 500 }
    );
  }
}
