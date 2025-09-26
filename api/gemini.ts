// api/gemini.ts
import { GoogleGenAI, Chat } from "@google/genai";
import type { Assistant } from '../constants';
import type { ChatMessage, Part } from '../types';

// This function will be deployed as a Vercel Serverless Function
export const config = {
  runtime: 'edge',
};

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }
  
  // IMPORTANT: The API key is now read from environment variables on the server.
  // It is NEVER exposed to the client.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured in environment variables.");
  }
  
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

function getPlainText(parts: Part[]): string {
    const textPart = parts.find(part => 'text' in part) as { text: string } | undefined;
    return textPart?.text || '';
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { assistant, history, type } = await req.json() as { assistant: Assistant, history: ChatMessage[], type: 'chat' | 'title' };
    const ai = getAiClient();

    if (type === 'title') {
        const conversationForTitle = history
            .slice(0, 4)
            .map(msg => `${msg.role}: ${getPlainText(msg.parts)}`)
            .join('\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following conversation, create a short, descriptive title (maximum 5 words). Do not use quotes.\n\nConversation:\n${conversationForTitle}`,
        });

        const title = response.text.trim().replace(/"/g, '') || "Untitled Conversation";
        return new Response(JSON.stringify({ title }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }


    // --- Handle Chat Streaming ---
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: assistant.prompt,
        },
        history: history.slice(0, -1) // Send all but the last message
    });
    
    const lastMessage = history[history.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
        return new Response('Invalid last message in history', { status: 400 });
    }

    // Pass the parts array directly to sendMessageStream, which is a valid overload.
    // This simplifies the call and resolves the hanging issue.
    const result = await chat.sendMessageStream(lastMessage.parts);

    // Create a new ReadableStream to pipe the Gemini response through
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error("Error in serverless function:", error);
    if (error.message.includes("API key")) {
        return new Response("Server configuration error: Gemini API key is missing. Please check your environment variables on Vercel.", { status: 500 });
    }
    return new Response(`An error occurred on the server: ${error.message}`, { status: 500 });
  }
}