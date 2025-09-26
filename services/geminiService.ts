import type { Assistant } from '../constants';
import type { ChatMessage } from '../types';

/**
 * Sends the chat history to the secure serverless function and streams the response.
 * @param assistant The selected assistant profile.
 * @param history The current chat message history.
 * @returns An async generator that yields the text chunks of the AI's response.
 */
export async function* getChatResponse(assistant: Assistant, history: ChatMessage[]) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // By sending only the prompt string instead of the entire assistant object,
            // we significantly reduce the request payload size. This prevents potential
            // errors from exceeding serverless function limits and improves performance.
            body: JSON.stringify({ prompt: assistant.prompt, history, type: 'chat' }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${errorText}`);
        }

        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            yield decoder.decode(value, { stream: true });
        }
    } catch (error: any) {
        console.error("Error fetching chat response from serverless function:", error);
        // Re-throw the error so it can be caught by the calling component (App.tsx)
        // This allows the UI to handle the error state, such as stopping the loading indicator.
        throw error;
    }
}

/**
 * Requests a chat title from the secure serverless function.
 * @param history The chat history to be summarized.
 * @returns A promise that resolves to a string containing the chat title.
 */
export async function getChatTitle(history: ChatMessage[]): Promise<string> {
    if (history.length === 0) {
        return "New Chat";
    }

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history, type: 'title' }),
        });
        
        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Server error: ${response.status} ${errorText}`);
        }
        
        const { title } = await response.json();
        return title || "Untitled Conversation";

    } catch (error) {
        console.error("Error generating title via serverless function:", error);
        return "New Chat"; // Fallback title
    }
}