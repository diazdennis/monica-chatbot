/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useHeyGen } from '@/hooks/useHeyGen';
import { ChatPanel } from './ChatPanel';
import { InputArea } from './InputArea';
import { CtaAction } from '@/lib/api';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  clinicName?: string;
}

type ViewMode = 'avatar' | 'conversation';
type WidgetSize = 'normal' | 'large';

const ChatWidget = ({
  position = 'bottom-right',
  primaryColor = '#14b8a6',
  clinicName = 'Primal Health',
}: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('avatar');
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('normal');
  const [isMuted, setIsMuted] = useState(true);
  const [greetingSpoken, setGreetingSpoken] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    messages,
    isLoading: isChatLoading,
    lastCta,
    sendUserMessage,
    initializeChat,
  } = useChat();

  const {
    isConnected,
    isLoading: isAvatarLoading,
    isSpeaking,
    error: avatarError,
    stream,
    connect,
    speak,
  } = useHeyGen();

  // Connect stream to video element when stream is available or when switching back to avatar view
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Connecting stream to video element');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, viewMode]); // Also re-run when viewMode changes

  // Speak greeting after avatar is connected
  useEffect(() => {
    const speakGreeting = async () => {
      if (isConnected && stream && !greetingSpoken && messages.length > 0) {
        // Wait a bit for avatar to be fully ready
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const lastAssistantMessage = messages.find((m) => m.role === 'assistant');
        if (lastAssistantMessage) {
          console.log('Speaking greeting...');
          setGreetingSpoken(true);
          await speak(lastAssistantMessage.content);
        }
      }
    };
    speakGreeting();
  }, [isConnected, stream, greetingSpoken, messages, speak]);

  // Unmute when user first interacts (browser requirement)
  const handleUnmute = useCallback(() => {
    if (videoRef.current && isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleConnect = useCallback(async () => {
    try {
      // Start connecting to avatar
      connect();
      // Get the greeting (don't wait for avatar to speak it yet)
      await initializeChat();
    } catch (error) {
      console.error('Failed to initialize:', error);
      await initializeChat();
    }
  }, [connect, initializeChat]);

  // Initialize when widget opens for the first time
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      setHasInteracted(true);
      handleConnect();
    }
  }, [isOpen, hasInteracted]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const response = await sendUserMessage(content);
      if (response && isConnected) {
        await speak(response);
      }
    },
    [sendUserMessage, speak, isConnected]
  );

  const handleCtaClick = useCallback((cta: CtaAction) => {
    if (cta.type === 'bloodwork_info') {
      window.open('https://example.com/bloodwork', '_blank');
    } else if (cta.type === 'book_consult') {
      window.open('https://example.com/book', '_blank');
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'avatar' ? 'conversation' : 'avatar'));
  }, []);

  const toggleSize = useCallback(() => {
    setWidgetSize((prev) => (prev === 'normal' ? 'large' : 'normal'));
  }, []);

  const positionClasses = position === 'bottom-right' ? 'right-4 sm:right-6' : 'left-4 sm:left-6';

  // Size configurations
  const sizeConfig = {
    normal: {
      width: 'w-[360px] sm:w-[400px]',
      height: 'h-[600px]',
      avatarHeight: 'h-full',
    },
    large: {
      width: 'w-[500px] sm:w-[600px]',
      height: 'h-[700px]',
      avatarHeight: 'h-full',
    },
  };

  const currentSize = sizeConfig[widgetSize];

  return (
    <>
      {/* Chat Widget Container */}
      <div
        className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-9999 font-sans`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Expanded Chat Panel */}
        {isOpen && !isMinimized && (
          <div
            className={`mb-4 ${currentSize.width} ${currentSize.height} max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp transition-all duration-300`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div
              className="p-3 text-white flex items-center justify-between shrink-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #06b6d4 100%)` }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar thumbnail */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/20 shrink-0">
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  {isConnected && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Monica</h3>
                  <p className="text-xs text-white/80">
                    {isConnected
                      ? isSpeaking
                        ? 'Speaking...'
                        : 'Online'
                      : isAvatarLoading
                        ? 'Connecting...'
                        : 'Ready'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* View Toggle Button */}
                <button
                  onClick={toggleViewMode}
                  className={`w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors ${viewMode === 'conversation' ? 'bg-white/20' : ''}`}
                  title={viewMode === 'avatar' ? 'Show Conversation' : 'Show Avatar'}
                >
                  {viewMode === 'avatar' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                {/* Zoom button */}
                <button
                  onClick={toggleSize}
                  className={`w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors ${widgetSize === 'large' ? 'bg-white/20' : ''}`}
                  title={widgetSize === 'normal' ? 'Zoom In' : 'Zoom Out'}
                >
                  {widgetSize === 'normal' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                      />
                    </svg>
                  )}
                </button>
                {/* Minimize button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Minimize"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 12H6"
                    />
                  </svg>
                </button>
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Content Area - Both views rendered, one visible at a time */}
            <div className="flex-1 overflow-hidden relative">
              {/* Avatar View - Always rendered, hidden when in conversation mode */}
              <div
                className={`absolute inset-0 bg-slate-900 flex items-center justify-center transition-opacity duration-300 ${viewMode === 'avatar' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                {/* Video element - always present to maintain stream connection */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className={`absolute inset-0 w-full h-full object-cover ${isConnected && stream ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Overlays on top of video */}
                {isConnected && stream && viewMode === 'avatar' && (
                  <>
                    {/* Unmute button overlay */}
                    {isMuted && (
                      <button
                        onClick={handleUnmute}
                        className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors z-20"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                          />
                        </svg>
                        Click to unmute
                      </button>
                    )}

                    {/* Thinking indicator - shows while waiting for response */}
                    {isChatLoading && !isSpeaking && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full z-20">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                        <span className="text-xs text-white ml-1">Thinking...</span>
                      </div>
                    )}

                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 rounded-full z-20">
                        <span className="w-1.5 h-3 bg-teal-400 rounded-full animate-pulse" />
                        <span
                          className="w-1.5 h-4 bg-teal-400 rounded-full animate-pulse"
                          style={{ animationDelay: '100ms' }}
                        />
                        <span
                          className="w-1.5 h-2 bg-teal-400 rounded-full animate-pulse"
                          style={{ animationDelay: '200ms' }}
                        />
                        <span className="text-xs text-white ml-1">Speaking...</span>
                      </div>
                    )}
                  </>
                )}

                {/* Loading/Error states */}
                {!isConnected && !stream && (
                  <>
                    {isAvatarLoading ? (
                      <div className="flex flex-col items-center gap-3 z-20">
                        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-300">Connecting to Monica...</span>
                      </div>
                    ) : avatarError ? (
                      <div className="flex flex-col items-center gap-3 px-6 text-center z-20">
                        <div className="w-20 h-20 rounded-full bg-linear-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                          M
                        </div>
                        <p className="text-sm text-slate-300">Avatar unavailable</p>
                        <p className="text-xs text-slate-400">{avatarError}</p>
                        <button
                          onClick={toggleViewMode}
                          className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-colors"
                        >
                          Switch to Conversation
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 z-20">
                        <div className="w-24 h-24 rounded-full bg-linear-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold animate-pulse">
                          M
                        </div>
                        <span className="text-sm text-slate-300">Ready to chat!</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Conversation View */}
              <div
                className={`absolute inset-0 bg-slate-50 transition-opacity duration-300 ${viewMode === 'conversation' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                <ChatPanel
                  messages={messages}
                  isLoading={isChatLoading}
                  cta={lastCta}
                  onCtaClick={handleCtaClick}
                />
              </div>
            </div>

            {/* Input Area */}
            <div className="shrink-0">
              <InputArea
                onSend={handleSendMessage}
                disabled={isChatLoading || isSpeaking}
                placeholder={isSpeaking ? 'Monica is speaking...' : 'Type or hold mic to speak...'}
                holdToRecord={true}
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 shrink-0">
              <p className="text-[10px] text-slate-400 text-center">
                Powered by {clinicName} • AI Assistant
              </p>
            </div>
          </div>
        )}

        {/* Minimized state */}
        {isOpen && isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="mb-4 w-full max-w-[300px] p-3 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center gap-3 hover:shadow-xl transition-all"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #06b6d4 100%)` }}
            >
              M
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-800">Monica</p>
              <p className="text-xs text-slate-500">Click to continue chatting</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center text-white relative"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #06b6d4 100%)`,
          }}
          title={isOpen ? 'Close chat' : 'Chat with Monica'}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {/* Notification dot */}
              {!hasInteracted && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Global styles for animation */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
