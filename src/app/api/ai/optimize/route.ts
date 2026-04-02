import { NextRequest, NextResponse } from 'next/server';
import { runFullPipeline } from '@/lib/ai/pipeline';

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
    
    const result = await runFullPipeline(resumeText, jobDescription);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: error.message || 'Optimization failed' },
      { status: 500 }
    );
  }
}
