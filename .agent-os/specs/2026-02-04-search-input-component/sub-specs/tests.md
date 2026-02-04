# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-02-04-search-input-component/spec.md

> Created: 2026-02-04
> Version: 1.0.0

## Test Coverage

### Unit Tests

**SearchInput Component**

- Renders input with placeholder text
- Renders input with provided value
- Calls onChange when user types
- Calls onSearch when Enter is pressed
- Calls onClear when Escape is pressed
- Does not call onSearch/onClear when callbacks not provided
- Renders voice button when voice.enabled is true
- Hides voice button when voice.enabled is false
- Calls voice.onToggle when voice button clicked
- Shows listening state (red background) when voice.isListening
- Shows idle state when not listening
- Shows loading indicator when isLoading is true
- Auto-focuses input when autoFocus is true
- Has correct aria-label on input
- Voice button has aria-pressed attribute

### Integration Tests

**SearchInput with useSearch**

- Typing triggers search after debounce
- Enter key searches immediately
- Escape key clears query and results
- Loading state shows during search

**SearchInput with useVoice**

- Voice button toggles listening state
- Voice result populates input field
- Voice result triggers search

### Accessibility Tests

- Input is keyboard accessible (Tab to focus)
- Voice button is keyboard accessible (Tab + Enter)
- Focus outline visible on input
- Focus outline visible on voice button
- Screen reader announces loading state

## Test File Structure

```
tests/
└── components/
    └── SearchInput.test.tsx
```

## Mocking Requirements

- **useVoice hook:** Mock for testing voice button states without browser Speech API
- **theme object:** Use actual theme values (no mocking needed)

## Test Setup

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/SearchInput';
```

Note: May need to add `@testing-library/react` and `@testing-library/user-event` as dev dependencies if not already present.

## Test Priority

1. **P0 (Must have):** onChange, onSearch (Enter), onClear (Escape), voice toggle
2. **P1 (Should have):** Loading state, aria labels
3. **P2 (Nice to have):** Integration tests with hooks
