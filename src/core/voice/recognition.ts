/**
 * Voice Input Module
 * 
 * Wraps the Web Speech API for voice-to-text search.
 * Handles browser compatibility, normalization, and error states.
 */

import type {
  IVoiceInput,
  VoiceState,
  VoiceResult,
  VoiceError,
  VoiceErrorType,
} from '@/types';
import { normalizeVoice } from '@/core/search/fuzzy';

// =============================================================================
// BROWSER COMPATIBILITY
// =============================================================================

/**
 * Get SpeechRecognition constructor (browser-specific)
 */
function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null;

  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

/**
 * Check if voice input is supported
 */
export function isVoiceSupported(): boolean {
  return getSpeechRecognition() !== null;
}

// =============================================================================
// VOICE INPUT IMPLEMENTATION
// =============================================================================

export class VoiceInput implements IVoiceInput {
  private recognition: SpeechRecognition | null = null;
  private _state: VoiceState = 'idle';
  private _isSupported: boolean;

  // Event handlers
  onResult: ((result: VoiceResult) => void) | null = null;
  onError: ((error: VoiceError) => void) | null = null;
  onStateChange: ((state: VoiceState) => void) | null = null;

  constructor() {
    const SpeechRecognitionClass = getSpeechRecognition();
    this._isSupported = SpeechRecognitionClass !== null;

    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.configureRecognition();
    }
  }

  get isSupported(): boolean {
    return this._isSupported;
  }

  get state(): VoiceState {
    return this._state;
  }

  /**
   * Start listening for voice input
   */
  start(): void {
    if (!this.recognition) {
      this.handleError('not-supported', 'Voice input is not supported in this browser');
      return;
    }

    if (this._state === 'listening') {
      return; // Already listening
    }

    try {
      this.setState('listening');
      this.recognition.start();
    } catch (error) {
      // Handle "already started" error
      if ((error as Error).message?.includes('already started')) {
        return;
      }
      this.handleError('unknown', (error as Error).message);
    }
  }

  /**
   * Stop listening and process final result
   */
  stop(): void {
    if (!this.recognition) return;

    if (this._state === 'listening') {
      this.setState('processing');
      this.recognition.stop();
    }
  }

  /**
   * Abort without processing
   */
  abort(): void {
    if (!this.recognition) return;

    this.recognition.abort();
    this.setState('idle');
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private configureRecognition(): void {
    if (!this.recognition) return;

    // Configuration
    this.recognition.continuous = false;        // Single utterance
    this.recognition.interimResults = true;     // Show partial results
    this.recognition.maxAlternatives = 1;       // Best result only
    this.recognition.lang = 'en-US';            // English

    // Event handlers
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleSpeechError(event);
    };

    this.recognition.onend = () => {
      if (this._state !== 'error') {
        this.setState('idle');
      }
    };

    this.recognition.onnomatch = () => {
      this.handleError('no-speech', 'No speech detected');
    };
  }

  private handleResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    if (!result) return;

    const transcript = result[0];
    if (!transcript) return;

    const raw = transcript.transcript;
    const normalized = normalizeVoice(raw);
    const isFinal = result.isFinal;

    const voiceResult: VoiceResult = {
      raw,
      normalized,
      confidence: transcript.confidence,
      isFinal,
    };

    if (isFinal) {
      this.setState('idle');
    }

    this.onResult?.(voiceResult);
  }

  private handleSpeechError(event: SpeechRecognitionErrorEvent): void {
    const errorMap: Record<string, VoiceErrorType> = {
      'not-allowed': 'permission-denied',
      'no-speech': 'no-speech',
      'audio-capture': 'audio-capture',
      'network': 'network',
      'aborted': 'aborted',
    };

    const errorType = errorMap[event.error] ?? 'unknown';
    const recoverable = ['no-speech', 'aborted', 'network'].includes(errorType);

    this.handleError(errorType, event.message || event.error, recoverable);
  }

  private handleError(
    type: VoiceErrorType,
    message: string,
    recoverable: boolean = false
  ): void {
    this.setState('error');

    const error: VoiceError = {
      type,
      message,
      recoverable,
    };

    this.onError?.(error);

    // Reset to idle after error
    setTimeout(() => {
      if (this._state === 'error') {
        this.setState('idle');
      }
    }, 2000);
  }

  private setState(state: VoiceState): void {
    this._state = state;
    this.onStateChange?.(state);
  }
}
