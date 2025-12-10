'use client';

import { useRef, useEffect, useState } from 'react';
import { Message, CtaAction, generateTranscript, downloadTranscript } from '@/lib/api';
import { MessageBubble } from './MessageBubble';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  cta: CtaAction | null;
  onCtaClick?: (action: CtaAction) => void;
  sessionId: string;
}

export function ChatPanel({ messages, isLoading, cta, onCtaClick, sessionId }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDownloadTranscript = async () => {
    if (messages.length === 0 || isDownloading) return;

    setIsDownloading(true);
    try {
      const transcript = await generateTranscript(sessionId, messages);
      downloadTranscript(transcript);
    } catch (error) {
      console.error('Failed to download transcript:', error);
      alert('Failed to generate transcript. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Download Button */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
          <span className="text-xs text-slate-500">{messages.length} messages</span>
          <button
            onClick={handleDownloadTranscript}
            disabled={isDownloading || messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download transcript with summary"
          >
            {isDownloading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      )}

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
