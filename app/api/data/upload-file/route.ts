import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Create a new FormData instance for OpenAI
    const formDataForOpenAI = new FormData();
    formDataForOpenAI.append("file", file);
    formDataForOpenAI.append("purpose", "assistants");

    // Upload file to OpenAI
    const response = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    return NextResponse.json({ 
      fileId: response.id,
      filename: file.name 
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 