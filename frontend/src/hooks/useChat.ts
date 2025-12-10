'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatResponse, CtaAction, sendMessage, getGreeting } from '@/lib/api';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  lastCta: CtaAction | null;
  lastGuardrail: string | null;
  sendUserMessage: (content: string) => Promise<string | null>;
  initializeChat: () => Promise<string | null>;
  clearChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => uuidv4());
  const [lastCta, setLastCta] = useState<CtaAction | null>(null);
  const [lastGuardrail, setLastGuardrail] = useState<string | null>(null);

  const initializeChat = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getGreeting(sessionId);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
      };

      setMessages([assistantMessage]);
      setLastCta(response.cta || null);

      return response.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const sendUserMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      const userMessage: Message = { role: 'user', content };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const allMessages = [...messages, userMessage];
        const response = await sendMessage(sessionId, allMessages);

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setLastCta(response.cta || null);
        setLastGuardrail(response.guardrailTriggered || null);

        return response.message;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [messages, sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastCta(null);
    setLastGuardrail(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    lastCta,
    lastGuardrail,
    sendUserMessage,
    initializeChat,
    clearChat,
  };
}
