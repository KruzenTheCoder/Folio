import { NextRequest } from 'next/server';
import { runFullPipeline } from '@/lib/ai/pipeline';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await runFullPipeline(
          resumeText,
          jobDescription,
          (step, data) => {
            const message = JSON.stringify({ step, data }) + '\n';
            controller.enqueue(encoder.encode(message));
          }
        );
        
        controller.close();
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: error.message }) + '\n')
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
