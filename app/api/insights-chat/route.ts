import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, threadId, fileIds } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) {
      throw new Error("Missing OpenAI Assistant ID. Check your environment variables.");
    }

    let finalThreadId = threadId;

    // Create a new thread if one does not exist
    if (!finalThreadId) {
      const thread = await openai.beta.threads.create();
      finalThreadId = thread.id;
    }
    type FlexibleMessageCreateParams = {
      role: "user";
      content: string;
      file_ids?: string[];
    };
    // Step 1: Create a message inside the thread (with optional files attached)
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
      file_ids: fileIds?.length ? fileIds : undefined,
    } as FlexibleMessageCreateParams);

    // Step 2: Start a run on that thread
    // OpenAI SDK types outdated - file_ids supported at runtime, ignore TS error

    const run = await openai.beta.threads.runs.create(finalThreadId, {
      assistant_id: assistantId,
      instructions: "Use the uploaded research files and provided strategy context to generate insights.",
    });

    // Step 3: Stream the assistant's response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    async function pollRun() {
      let runStatus = await openai.beta.threads.runs.retrieve(finalThreadId!, run.id);

      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
        runStatus = await openai.beta.threads.runs.retrieve(finalThreadId!, run.id);
      }

      if (runStatus.status === "completed") {
        const messages = await openai.beta.threads.messages.list(finalThreadId!);
        const lastMessage = messages.data.find(msg => msg.role === "assistant");

        if (lastMessage && lastMessage.content[0]?.type === "text") {
          const text = lastMessage.content[0].text.value;
          await writer.write(encoder.encode(`data: ${JSON.stringify({ text, threadId: finalThreadId })}\n\n`));
        }
      } else {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }

      await writer.close();
    }

    pollRun().catch(async (err) => {
      console.error("Error during pollRun:", err);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: "An error occurred during processing." })}\n\n`));
      await writer.close();
    });

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}
