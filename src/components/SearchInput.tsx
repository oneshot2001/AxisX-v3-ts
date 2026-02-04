/**
 * SearchInput Component
 *
 * Search input with voice toggle, keyboard shortcuts, and loading states.
 * Designed for field use with voice-first workflow.
 */

import { useCallback, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { theme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface SearchInputProps {
  /** Current query value */
  value: string;

  /** Callback when query changes */
  onChange: (value: string) => void;

  /** Callback for immediate search (Enter key) */
  onSearch?: () => void;

  /** Callback to clear query and results */
  onClear?: () => void;

  /** Placeholder text */
  placeholder?: string;

  /** Is search currently loading */
  isLoading?: boolean;

  /** Voice input configuration */
  voice?: {
    enabled: boolean;
    isListening: boolean;
    onToggle: () => void;
  };

  /** Auto-focus on mount */
  autoFocus?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search competitor model, Axis model, or manufacturer...',
  isLoading = false,
  voice,
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch();
      } else if (e.key === 'Escape' && onClear) {
        onClear();
      }
    },
    [onSearch, onClear]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const showVoiceButton = voice?.enabled === true;

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        position: 'relative',
      }}
    >
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search for camera models"
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          paddingRight: isLoading ? '2.5rem' : '1rem',
          fontSize: '1rem',
          borderRadius: theme.borderRadius.md,
          border: `2px solid ${theme.colors.border}`,
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div
          role="status"
          aria-label="Searching"
          style={{
            position: 'absolute',
            right: showVoiceButton ? '3.5rem' : '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.25rem',
            height: '1.25rem',
            border: `2px solid ${theme.colors.border}`,
            borderTopColor: theme.colors.primary,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      )}

      {/* Voice Button */}
      {showVoiceButton && (
        <button
          type="button"
          onClick={voice.onToggle}
          aria-label="Voice search"
          aria-pressed={voice.isListening}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: theme.borderRadius.md,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: voice.isListening
              ? theme.colors.error
              : theme.colors.bgAlt,
            color: voice.isListening ? '#fff' : theme.colors.textPrimary,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Mic size={20} />
        </button>
      )}

      {/* Keyframe animation for spinner */}
      <style>
        {`
          @keyframes spin {
            to { transform: translateY(-50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
