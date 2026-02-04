# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2026-02-04-search-input-component/spec.md

> Created: 2026-02-04
> Version: 1.0.0

## Technical Requirements

### Component Interface

```typescript
interface SearchInputProps {
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
```

### Component Structure

```
src/components/
├── SearchInput.tsx      # Main component
├── SearchInput.test.tsx # Component tests
└── index.ts             # Barrel export
```

### Styling Approach

- Use inline styles consistent with existing App.tsx pattern
- Reference `theme` object for colors, spacing, and typography
- Support both light focus states and voice-listening states

### Keyboard Handling

| Key | Action |
|-----|--------|
| Enter | Call `onSearch()` for immediate search |
| Escape | Call `onClear()` to reset input and results |

### Voice Button States

| State | Icon | Background | Animation |
|-------|------|------------|-----------|
| Idle (voice available) | `Mic` | `theme.colors.bgAlt` | None |
| Listening | `Mic` | `theme.colors.error` (red) | Pulse animation |
| Voice unavailable | Hidden | N/A | N/A |

### Accessibility Requirements

- Input has `aria-label` for screen readers
- Voice button has `aria-pressed` state
- Focus visible outline on all interactive elements
- Loading state announced via `aria-live`

## Approach Options

**Option A: Inline styles only** (Selected)
- Pros: Consistent with existing codebase, no new dependencies
- Cons: No hover/focus pseudo-classes without JS

**Option B: CSS modules**
- Pros: Better pseudo-class support, cleaner JSX
- Cons: Adds build complexity, different from existing pattern

**Rationale:** Maintain consistency with existing App.tsx approach. The theme object provides all needed values, and keyboard/voice states can be handled in component state.

## External Dependencies

- **lucide-react** (already installed) - For `Mic`, `MicOff`, `Search`, `X` icons

No new dependencies required.

## Integration Points

### With useSearch Hook

```typescript
const { query, setQuery, search, clear, isSearching } = useSearch(engine);

<SearchInput
  value={query}
  onChange={setQuery}
  onSearch={search}
  onClear={clear}
  isLoading={isSearching}
/>
```

### With useVoice Hook

```typescript
const { isSupported, isListening, toggle } = useVoice({
  onResult: (text) => setQuery(text),
});

<SearchInput
  // ...other props
  voice={{
    enabled: isSupported,
    isListening,
    onToggle: toggle,
  }}
/>
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/SearchInput.tsx` | Create | New component |
| `src/components/index.ts` | Create | Barrel export |
| `src/App.tsx` | Modify | Import and use SearchInput |
| `tests/components/SearchInput.test.tsx` | Create | Component tests |
