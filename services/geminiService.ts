import { GoogleGenAI, Chat } from "@google/genai";
import type { Assistant } from '../constants';
import type { ChatMessage, Part } from '../types';

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This prevents the app from crashing on load if the API key is missing.
 */
// FIX: Per @google/genai guidelines, the API key must be read from process.env.API_KEY.
// This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
// The guideline also states to assume the key is present, so the fallback and error handling are removed.
function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }
  
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  return ai;
}


export async function* getChatResponse(assistant: Assistant, history: ChatMessage[]) {
    const ai = getAiClient();
    
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: assistant.prompt,
        },
        history: history.slice(0, -1) // Send all but the last message
    });
    
    const lastMessage = history[history.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
        // Cannot send an empty message or a message from the model
        return;
    }

    const result = await chat.sendMessageStream({ message: lastMessage.parts as Part[] });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
}

export function getPlainText(parts: Part[]): string {
    const textPart = parts.find(part => 'text' in part) as { text: string } | undefined;
    return textPart?.text || '';
}


export async function getChatTitle(history: ChatMessage[]): Promise<string> {
    if (history.length === 0) {
        return "New Chat";
    }

    const conversationForTitle = history
        .slice(0, 4) // Use first few messages for brevity
        .map(msg => `${msg.role}: ${getPlainText(msg.parts)}`)
        .join('\n');

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following conversation, create a short, descriptive title (maximum 5 words). Do not use quotes.\n\nConversation:\n${conversationForTitle}`,
        });
        const title = response.text.trim().replace(/"/g, ''); // Clean up quotes
        return title || "Untitled Conversation";
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Chat";
    }
}