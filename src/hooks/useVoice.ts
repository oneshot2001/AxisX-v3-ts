/**
 * useVoice Hook
 * 
 * Voice-to-text input for React components.
 * Handles browser compatibility and state management.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { VoiceState, VoiceResult, VoiceError } from '@/types';
import { VoiceInput, isVoiceSupported } from '@/core/voice';

// =============================================================================
// TYPES
// =============================================================================

export interface UseVoiceOptions {
  /** Callback when voice result received */
  onResult?: (text: string) => void;
  
  /** Callback on error */
  onError?: (error: VoiceError) => void;
  
  /** Use normalized text (default: true) */
  normalized?: boolean;
  
  /** Auto-stop after result (default: true) */
  autoStop?: boolean;
}

export interface UseVoiceReturn {
  /** Is voice supported in this browser */
  isSupported: boolean;
  
  /** Current voice state */
  state: VoiceState;
  
  /** Is currently listening */
  isListening: boolean;
  
  /** Start listening */
  start: () => void;
  
  /** Stop listening */
  stop: () => void;
  
  /** Toggle listening */
  toggle: () => void;
  
  /** Last result */
  lastResult: VoiceResult | null;
  
  /** Last error */
  lastError: VoiceError | null;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const {
    onResult,
    onError,
    normalized = true,
    autoStop = true,
  } = options;

  const [state, setState] = useState<VoiceState>('idle');
  const [lastResult, setLastResult] = useState<VoiceResult | null>(null);
  const [lastError, setLastError] = useState<VoiceError | null>(null);

  const voiceRef = useRef<VoiceInput | null>(null);
  const supported = isVoiceSupported();

  // Initialize voice input
  useEffect(() => {
    if (!supported) return;

    const voice = new VoiceInput();
    voiceRef.current = voice;

    // State change handler
    voice.onStateChange = (newState) => {
      setState(newState);
    };

    // Result handler
    voice.onResult = (result) => {
      setLastResult(result);
      setLastError(null);

      if (result.isFinal) {
        const text = normalized ? result.normalized : result.raw;
        onResult?.(text);

        if (autoStop) {
          voice.stop();
        }
      }
    };

    // Error handler
    voice.onError = (error) => {
      setLastError(error);
      onError?.(error);
    };

    return () => {
      voice.abort();
    };
  }, [supported, normalized, autoStop, onResult, onError]);

  // Start listening
  const start = useCallback(() => {
    if (!voiceRef.current) return;
    setLastError(null);
    voiceRef.current.start();
  }, []);

  // Stop listening
  const stop = useCallback(() => {
    if (!voiceRef.current) return;
    voiceRef.current.stop();
  }, []);

  // Toggle
  const toggle = useCallback(() => {
    if (state === 'listening') {
      stop();
    } else {
      start();
    }
  }, [state, start, stop]);

  return {
    isSupported: supported,
    state,
    isListening: state === 'listening',
    start,
    stop,
    toggle,
    lastResult,
    lastError,
  };
}
