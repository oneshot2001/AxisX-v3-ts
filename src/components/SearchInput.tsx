/**
 * SearchInput Component — Spotlight-grade hero search
 *
 * Single rounded-2xl input with:
 *   - Animated cycling placeholder (when empty + unfocused)
 *   - Inline mic button (right-trailing) with subtle ring on listening
 *   - Loading spinner that swaps for the search icon
 *   - Global ⌘K / Ctrl+K focus shortcut + visible kbd hint
 *   - Recent-search popover via cmdk (focus + empty + has recents)
 *
 * The public `SearchInputProps` contract is unchanged from the Fluent UI
 * version so App.tsx and the existing test suite keep working.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command } from 'cmdk';
import { Loader2, Mic, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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
// CONSTANTS
// =============================================================================

const PLACEHOLDER_CYCLE = [
  'Hikvision DS-2CD2143G2-I',
  'P3265-LVE',
  'mounts for Q6135-LE',
  'Verkada CD52',
  'Avigilon 4.0C-H4A-D1-IR',
  'Hanwha XND-8081V',
] as const;

const PLACEHOLDER_INTERVAL_MS = 3000;
const RECENTS_KEY = 'axisx.recentQueries';
const RECENTS_MAX = 6;

// =============================================================================
// RECENTS HELPERS
// =============================================================================

function loadRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .slice(0, RECENTS_MAX);
  } catch {
    return [];
  }
}

function pushRecent(query: string): string[] {
  if (typeof window === 'undefined') return [];
  const trimmed = query.trim();
  if (!trimmed) return loadRecents();
  try {
    const existing = loadRecents().filter(
      (q) => q.toLowerCase() !== trimmed.toLowerCase()
    );
    const next = [trimmed, ...existing].slice(0, RECENTS_MAX);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadRecents();
  }
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>(() => loadRecents());
  const [activeRecentIndex, setActiveRecentIndex] = useState(0);

  const showVoiceButton = voice?.enabled === true;
  const isListening = voice?.isListening === true;

  // ---------------------------------------------------------------------------
  // Auto-focus on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // ---------------------------------------------------------------------------
  // Animated placeholder cycle (only when empty + unfocused)
  // ---------------------------------------------------------------------------
  const isCycling = value.length === 0 && !isFocused;

  useEffect(() => {
    if (!isCycling) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_CYCLE.length);
    }, PLACEHOLDER_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isCycling]);

  // ---------------------------------------------------------------------------
  // Global ⌘K / Ctrl+K — focus only when no other input is active
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isAccel = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (!isAccel) return;

      const active = document.activeElement;
      const isOurInput = active === inputRef.current;
      const isBody = active === document.body || active === null;

      // Only intercept when focus is on body, our input, or nothing —
      // don't steal focus from other inputs/textareas.
      if (!isBody && !isOurInput) {
        const tag = (active as HTMLElement | null)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if ((active as HTMLElement | null)?.isContentEditable) return;
      }

      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ---------------------------------------------------------------------------
  // Click-outside collapses the recents popover
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isFocused) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [isFocused]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const commitRecent = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecents(pushRecent(q));
  }, []);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      const popoverOpen =
        isFocused && value.length === 0 && recents.length > 0;

      if (popoverOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        setActiveRecentIndex((i) => {
          const len = recents.length;
          if (e.key === 'ArrowDown') return (i + 1) % len;
          return (i - 1 + len) % len;
        });
        return;
      }

      if (e.key === 'Enter') {
        if (popoverOpen) {
          const pick = recents[activeRecentIndex];
          if (pick !== undefined) {
            onChange(pick);
            commitRecent(pick);
            if (onSearch) onSearch();
            return;
          }
        }
        if (onSearch) {
          commitRecent(value);
          onSearch();
        }
        return;
      }

      if (e.key === 'Escape' && onClear) {
        onClear();
      }
    },
    [
      isFocused,
      value,
      recents,
      activeRecentIndex,
      onChange,
      onSearch,
      onClear,
      commitRecent,
    ]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleVoiceClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      voice?.onToggle();
    },
    [voice]
  );

  const handleSelectRecent = useCallback(
    (q: string) => {
      onChange(q);
      commitRecent(q);
      if (onSearch) onSearch();
      inputRef.current?.blur();
      setIsFocused(false);
    },
    [onChange, commitRecent, onSearch]
  );

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const showRecents =
    isFocused && value.length === 0 && recents.length > 0;

  const animatedHint = useMemo(
    () => PLACEHOLDER_CYCLE[placeholderIndex] ?? PLACEHOLDER_CYCLE[0],
    [placeholderIndex]
  );

  // Reset active recent index when popover toggles or list changes
  useEffect(() => {
    setActiveRecentIndex(0);
  }, [showRecents, recents.length]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div data-swift className="relative w-full">
      <div ref={wrapperRef} className="relative">
        {/* Soft listening ring (animated opacity) */}
        {isListening && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[1.05rem]"
            style={{
              boxShadow: '0 0 0 1px oklch(0.62 0.22 25 / 0.5)',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Main input shell */}
        <div
          className={cn(
            'group relative flex h-16 items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 shadow-md transition-colors duration-150',
            isFocused && 'border-axis-yellow/50',
            isListening && 'border-[oklch(0.62_0.22_25_/_0.5)]'
          )}
        >
          {/* Leading icon — search or spinner */}
          <div className="flex size-6 shrink-0 items-center justify-center text-ink-faint">
            {isLoading ? (
              <Loader2
                role="progressbar"
                aria-label="Searching"
                className="size-5 animate-spin text-ink-muted"
              />
            ) : (
              <Search className="size-5" aria-hidden />
            )}
          </div>

          {/* Input + animated placeholder overlay */}
          <div className="relative flex-1">
            {/* Animated placeholder layer — sits over the (transparent) native placeholder */}
            {isCycling && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden"
              >
                <span className="mr-1.5 text-[16px] text-ink-faint">Try</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={animatedHint}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
                    className="truncate text-[16px] text-ink-faint"
                  >
                    {animatedHint}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Defer blur so a recents click can register first
                window.setTimeout(() => setIsFocused(false), 120);
              }}
              placeholder={placeholder}
              aria-label="Search for camera models"
              autoComplete="off"
              spellCheck={false}
              className={cn(
                'w-full bg-transparent text-[16px] leading-6 text-ink outline-none',
                'placeholder:text-ink-faint',
                // Hide the native placeholder while we cycle our own visual layer
                isCycling && 'placeholder:text-transparent'
              )}
            />
          </div>

          {/* Trailing controls — kbd hint + mic */}
          <div className="flex shrink-0 items-center gap-2">
            {!isFocused && value.length === 0 && (
              <kbd
                aria-hidden
                className="hidden h-6 select-none items-center gap-0.5 rounded-md border border-hairline bg-surface-2 px-1.5 font-mono text-[11px] font-medium text-ink-faint sm:inline-flex"
              >
                <span className="text-[12px] leading-none">⌘</span>
                <span>K</span>
              </kbd>
            )}

            {showVoiceButton && (
              <button
                type="button"
                onClick={handleVoiceClick}
                aria-label="Voice search"
                aria-pressed={isListening}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
                  isListening
                    ? 'text-[oklch(0.62_0.22_25)] hover:bg-[oklch(0.62_0.22_25_/_0.08)]'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                )}
              >
                {isListening ? (
                  <motion.span
                    className="inline-flex"
                    animate={{ opacity: [1, 0.55, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Mic className="size-[18px]" aria-hidden />
                  </motion.span>
                ) : (
                  <Mic className="size-[18px]" aria-hidden />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Recents popover (cmdk) */}
        <AnimatePresence>
          {showRecents && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50"
            >
              <Command
                shouldFilter={false}
                loop
                className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg"
              >
                <Command.List className="max-h-72 overflow-auto p-1.5">
                  <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Recent
                  </div>
                  <Command.Group>
                    {recents.map((q, idx) => {
                      const active = idx === activeRecentIndex;
                      return (
                        <Command.Item
                          key={`${q}-${idx}`}
                          value={q}
                          onSelect={() => handleSelectRecent(q)}
                          onMouseEnter={() => setActiveRecentIndex(idx)}
                          className={cn(
                            'flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[14px] text-ink',
                            active ? 'bg-surface-2' : 'hover:bg-surface-2'
                          )}
                        >
                          <Search className="size-3.5 text-ink-faint" aria-hidden />
                          <span className="truncate">{q}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
