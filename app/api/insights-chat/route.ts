import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// TODO: Move to environment variables
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

export async function POST(request: Request) {
  try {
    const { message, threadId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create or use existing thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
    }

    // Add message to thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: message,
    });

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start a run with streaming enabled
    const run = openai.beta.threads.runs.createAndStream(currentThreadId, {
      assistant_id: ASSISTANT_ID as string,
    });

    // Process the stream
    (async () => {
      try {
        for await (const event of run) {
          if (event.event === 'thread.message.delta') {
            const content = event.data.delta.content?.[0];
            if (content?.type === 'text' && content.text?.value) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({
                type: 'text',
                text: content.text.value,
                threadId: currentThreadId
              })}\n\n`));
            }
          }
        }
      } catch (error) {
        console.error('Error in stream:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          error: 'Stream processing failed'
        })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in insights-chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 