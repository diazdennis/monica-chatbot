'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
} from '@heygen/streaming-avatar';
import { getHeyGenToken } from '@/lib/api';

interface UseHeyGenReturn {
  isConnected: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
  stream: MediaStream | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
}

// Default avatar - using HeyGen's public avatars
// You can find available avatars by calling GET /api/heygen/avatars
// Common public avatars: 'Anna_public_3_20240108', 'josh_lite3_20230714', 'Kristin_public_2_20240108'
const DEFAULT_AVATAR_ID = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'Kristin_public_2_20240108';

export function useHeyGen(): UseHeyGenReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const avatarRef = useRef<StreamingAvatar | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        avatarRef.current.stopAvatar();
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get token from our backend
      const { token } = await getHeyGenToken();
      console.log('Got HeyGen token');

      // Initialize streaming avatar
      avatarRef.current = new StreamingAvatar({ token });

      // Set up event listeners
      avatarRef.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('Stream ready:', event);
        if (event.detail) {
          setStream(event.detail);
          setIsConnected(true);
        }
      });

      avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
        setIsSpeaking(true);
      });

      avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
        setIsSpeaking(false);
      });

      avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setIsConnected(false);
        setIsSpeaking(false);
        setStream(null);
      });

      // Start avatar session - using avatar's default voice
      console.log('Starting avatar with ID:', DEFAULT_AVATAR_ID);
      await avatarRef.current.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: DEFAULT_AVATAR_ID,
      });
    } catch (err: unknown) {
      console.error('Failed to connect to HeyGen:', err);

      // Extract meaningful error message
      let errorMessage = 'Failed to connect to avatar';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }

      // Add helpful context for common errors
      if (errorMessage.includes('voice not found')) {
        errorMessage = 'Voice configuration error. Using default voice.';
      } else if (errorMessage.includes('avatar not found')) {
        errorMessage = `Avatar "${DEFAULT_AVATAR_ID}" not found. Check available avatars at /api/heygen/avatars`;
      }

      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isLoading]);

  const disconnect = useCallback(async () => {
    if (avatarRef.current) {
      await avatarRef.current.stopAvatar();
      avatarRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    setStream(null);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!avatarRef.current || !isConnected) {
        console.warn('Avatar not connected');
        return;
      }

      try {
        console.log('Making avatar speak:', text.substring(0, 50) + '...');
        await avatarRef.current.speak({
          text,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      } catch (err) {
        console.error('Failed to make avatar speak:', err);
        setError(err instanceof Error ? err.message : 'Failed to speak');
      }
    },
    [isConnected]
  );

  const interrupt = useCallback(async () => {
    if (avatarRef.current && isSpeaking) {
      await avatarRef.current.interrupt();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return {
    isConnected,
    isLoading,
    isSpeaking,
    error,
    stream,
    connect,
    disconnect,
    speak,
    interrupt,
  };
}
