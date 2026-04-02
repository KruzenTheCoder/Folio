import { NextRequest, NextResponse } from 'next/server';
import { runGenerationPipeline } from '@/lib/ai/pipeline';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, jobDescription, userContext } = await req.json();
    
    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await runGenerationPipeline(
      jobTitle, 
      jobDescription, 
      userContext || {}
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
