'use client';

import { useRef, useEffect } from 'react';
import { Message, CtaAction } from '@/lib/api';
import { MessageBubble } from './MessageBubble';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  cta: CtaAction | null;
  onCtaClick?: (action: CtaAction) => void;
}

export function ChatPanel({ messages, isLoading, cta, onCtaClick }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Starting conversation...</p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-teal-600">Monica</span>
              </div>
              <div className="flex gap-1 mt-2">
                <span
                  className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CTA Buttons */}
      {cta && cta.type !== 'none' && (
        <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="flex gap-2 justify-center">
            {cta.type === 'bloodwork_info' && (
              <button
                onClick={() => onCtaClick?.(cta)}
                className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-medium hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
              >
                📊 {cta.label || 'Learn About Bloodwork'}
              </button>
            )}
            {cta.type === 'book_consult' && (
              <button
                onClick={() => onCtaClick?.(cta)}
                className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
              >
                📅 {cta.label || 'Book a Consultation'}
              </button>
            )}
            {cta.type === 'emergency' && (
              <button
                onClick={() => (window.location.href = 'tel:911')}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg animate-pulse"
              >
                🚨 Call 911
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
