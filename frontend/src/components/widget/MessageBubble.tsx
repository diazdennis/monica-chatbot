'use client';

import { Message } from '@/lib/api';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-md'
            : 'bg-white/80 backdrop-blur-sm text-slate-800 rounded-bl-md shadow-sm border border-slate-100'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-teal-600">Monica</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
