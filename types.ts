
export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string; // base64
  };
}

export type Part = TextPart | InlineDataPart;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Part[];
  timestamp: string;
}

export interface ChatSession {
    id: string;
    title: string;
    date: string; // ISO string
    messages: ChatMessage[];
}
