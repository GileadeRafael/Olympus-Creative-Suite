// api/gemini.ts
import { GoogleGenAI } from "@google/genai";
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

        // The user's previous issue was that the API call failed silently.
        // The fix was to sanitize the history to remove extra properties like 'timestamp'.
        // This is crucial for the API call to succeed.
        const sanitizedHistory = history.map(({ role, parts }) => ({ role, parts }));
        
        // FIX: Instead of using the subtle `systemInstruction`, we now use a more robust and explicit
        // method. We prepend the assistant's personality prompt to the beginning of the chat history
        // as the first "user" message, followed by a simple "model" confirmation. This ensures the
        // model always understands its role without any ambiguity, fixing the silent hanging issue.
        const chatHistoryWithPrompt = [
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: "Understood." }] },
            ...sanitizedHistory
        ];
        
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
                const result = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: chatHistoryWithPrompt,
                });

                for await (const chunk of result) {
                  if (chunk.text) {
                    controller.enqueue(encoder.encode(chunk.text));
                  }
                }
                controller.close();
            } catch(error) {
                console.error("Error during Gemini stream processing:", error);
                // Propagate the error to the client by calling controller.error.
                // This will cause the client-side reader to throw an error,
                // which can be caught to stop the loading state.
                controller.error(error);
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