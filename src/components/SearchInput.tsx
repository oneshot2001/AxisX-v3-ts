/**
 * SearchInput Component
 *
 * Search input with voice toggle, keyboard shortcuts, and loading states.
 * Designed for field use with voice-first workflow.
 *
 * Migrated to Fluent UI components.
 */

import { useCallback, useRef, useEffect } from 'react';
import {
  Input,
  Button,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Mic24Regular, Mic24Filled, Search24Regular } from '@fluentui/react-icons';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: '0.5rem',
    position: 'relative',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    width: '100%',
    fontSize: tokens.fontSizeBase400,
  },
  spinnerContainer: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  },
  voiceButton: {
    minWidth: '44px',
    height: '44px',
  },
  voiceButtonListening: {
    minWidth: '44px',
    height: '44px',
    animationName: {
      '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
      '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
      '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
});

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
  const styles = useStyles();
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
    <div className={styles.container}>
      {/* Search Input */}
      <div className={styles.inputWrapper}>
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search for camera models"
          className={styles.input}
          size="large"
          appearance="outline"
          contentBefore={<Search24Regular />}
          contentAfter={isLoading ? (
            <Spinner size="tiny" aria-label="Searching" />
          ) : undefined}
        />
      </div>

      {/* Voice Button */}
      {showVoiceButton && (
        <Button
          onClick={voice.onToggle}
          aria-label="Voice search"
          aria-pressed={voice.isListening}
          appearance={voice.isListening ? 'primary' : 'secondary'}
          className={voice.isListening ? styles.voiceButtonListening : styles.voiceButton}
          icon={voice.isListening ? <Mic24Filled /> : <Mic24Regular />}
          style={{
            backgroundColor: voice.isListening ? '#EF4444' : undefined,
          }}
        />
      )}
    </div>
  );
}
