// API_BASE_URL: set NEXT_PUBLIC_API_URL for dev, defaults to /api for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface CtaAction {
  type: 'bloodwork_info' | 'book_consult' | 'emergency' | 'none';
  label?: string;
  url?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  cta?: CtaAction;
  guardrailTriggered?: 'emergency' | 'medical_advice' | 'phi_request' | null;
}

export interface HeyGenTokenResponse {
  token: string;
}

export interface HeyGenSessionResponse {
  sessionId: string;
  accessToken: string;
  url: string;
}

export async function sendMessage(sessionId: string, messages: Message[]): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

export async function getGreeting(sessionId?: string): Promise<ChatResponse> {
  const url = sessionId
    ? `${API_BASE_URL}/chat/greeting?sessionId=${sessionId}`
    : `${API_BASE_URL}/chat/greeting`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get greeting');
  }

  return response.json();
}

export async function getHeyGenToken(): Promise<HeyGenTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/heygen/token`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to get HeyGen token');
  }

  return response.json();
}

export async function createHeyGenSession(): Promise<HeyGenSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/heygen/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quality: 'medium',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create HeyGen session');
  }

  return response.json();
}

export async function closeHeyGenSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/heygen/session/${sessionId}`, {
    method: 'DELETE',
  });
}

export interface TranscriptResponse {
  summary: string;
  transcript: string;
  generatedAt: string;
  sessionId: string;
}

export async function generateTranscript(
  sessionId: string,
  messages: Message[]
): Promise<TranscriptResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/transcript`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate transcript');
  }

  return response.json();
}

export function downloadTranscript(data: TranscriptResponse): void {
  const content = `${data.summary}\n\n${data.transcript}`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `monica-chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
