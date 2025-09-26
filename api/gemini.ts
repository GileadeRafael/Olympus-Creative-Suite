// api/gemini.ts
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, Part } from '../types';

// This function will be deployed as a Vercel Serverless Function
export const config = {
  runtime: 'edge',
};

function getAiClient(): GoogleGenAI {
  // IMPORTANT: The API key is now read from environment variables on the server.
  // It is NEVER exposed to the client.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured in environment variables.");
  }
  
  return new GoogleGenAI({ apiKey });
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
    const body = await req.json();
    const { type } = body;
    const ai = getAiClient();

    if (type === 'title') {
        const { history } = body as { history: ChatMessage[] };
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

    if (type === 'chat') {
        const { prompt, history } = body as { prompt: string, history: ChatMessage[] };

        // Sanitize history to ensure it only contains 'role' and 'parts'.
        const sanitizedHistory = history.map(({ role, parts }) => ({ role, parts }));
        
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
                // CORRECTED: The assistant's personality prompt is now correctly passed
                // as a `systemInstruction`, which is the idiomatic way to provide
                // context and instructions to the model for a conversation. This avoids
                // polluting the chat history with a non-user message and is more
                // reliable than the previous priming method.
                const result = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: sanitizedHistory,
                    config: {
                      systemInstruction: prompt,
                    },
                });

                for await (const chunk of result) {
                  if (chunk.text) {
                    controller.enqueue(encoder.encode(chunk.text));
                  }
                }
                controller.close();
            } catch(error: any) {
                console.error("Error during Gemini stream processing:", error);
                // Propagate the specific error message to the client.
                controller.error(new Error(error.message || 'Unknown stream error'));
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
    }
    
    return new Response('Invalid request type', { status: 400 });

  } catch (error: any) {
    console.error("Error in serverless function:", error);
    if (error.message.includes("API key")) {
        return new Response("Server configuration error: Gemini API key is missing. Please check your environment variables on Vercel.", { status: 500 });
    }
    return new Response(`An error occurred on the server: ${error.message}`, { status: 500 });
  }
}