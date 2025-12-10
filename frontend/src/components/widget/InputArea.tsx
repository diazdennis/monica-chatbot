/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback, KeyboardEvent, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  holdToRecord?: boolean;
}

export function InputArea({ onSend, disabled, placeholder, holdToRecord = false }: InputAreaProps) {
  const [input, setInput] = useState('');
  const isHoldingRef = useRef(false);
  const { isListening, isSupported, transcript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  // Update input when speech is recognized
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-send when speech recognition stops and we have a transcript
  useEffect(() => {
    if (!isListening && transcript && !disabled) {
      // Small delay to ensure transcript is complete
      const timer = setTimeout(() => {
        if (transcript.trim()) {
          onSend(transcript.trim());
          setInput('');
          resetTranscript();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, disabled, onSend, resetTranscript]);

  const handleSend = useCallback(() => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      resetTranscript();
    }
  }, [input, disabled, onSend, resetTranscript]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Click-to-toggle behavior
  const handleMicClick = useCallback(() => {
    if (holdToRecord) return; // Ignore clicks in hold mode
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening, holdToRecord]);

  // Hold-to-record: Start recording on press
  const handleMicDown = useCallback(() => {
    if (!holdToRecord || disabled) return;
    isHoldingRef.current = true;
    startListening();
  }, [holdToRecord, disabled, startListening]);

  // Hold-to-record: Stop recording on release
  const handleMicUp = useCallback(() => {
    if (!holdToRecord) return;
    isHoldingRef.current = false;
    if (isListening) {
      stopListening();
    }
  }, [holdToRecord, isListening, stopListening]);

  // Handle mouse/touch leaving the button while holding
  const handleMicLeave = useCallback(() => {
    if (holdToRecord && isHoldingRef.current && isListening) {
      isHoldingRef.current = false;
      stopListening();
    }
  }, [holdToRecord, isListening, stopListening]);

  return (
    <div className="p-3 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
      {/* Listening indicator */}
      {isListening && (
        <div className="mb-2 flex items-center justify-center gap-2 text-sm text-teal-600">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <span>{holdToRecord ? 'Recording... release to send' : 'Listening... speak now'}</span>
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* Microphone Button */}
        {isSupported && (
          <button
            onClick={handleMicClick}
            onMouseDown={handleMicDown}
            onMouseUp={handleMicUp}
            onMouseLeave={handleMicLeave}
            onTouchStart={handleMicDown}
            onTouchEnd={handleMicUp}
            disabled={disabled}
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed select-none ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white scale-110'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={
              holdToRecord ? 'Hold to record' : isListening ? 'Stop listening' : 'Start voice input'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`}
            >
              <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
              <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
          </button>
        )}

        {/* Text Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Recording...' : placeholder || 'Type or hold mic to speak...'}
          disabled={disabled || isListening}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 bg-white"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim() || isListening}
          className="shrink-0 w-12 h-12 rounded-full bg-linear-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>

      {/* Voice input hint */}
      {isSupported && !isListening && (
        <p className="mt-2 text-xs text-slate-400 text-center">
          {holdToRecord ? 'Hold the microphone button to record' : 'Click the microphone to speak'}
        </p>
      )}
    </div>
  );
}
