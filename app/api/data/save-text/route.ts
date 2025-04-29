import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, threadId } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    let currentThreadId = threadId;

    // If no threadId exists, create a new thread
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
    }

    // Add the message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: `Context upload: Below is research data for future reference. No reply needed.\n\n${text}`,
    });

    return NextResponse.json({ threadId: currentThreadId });
  } catch (error) {
    console.error("Error saving text:", error);
    return NextResponse.json(
      { error: "Failed to save text" },
      { status: 500 }
    );
  }
} 