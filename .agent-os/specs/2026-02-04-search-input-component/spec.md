# Spec Requirements Document

> Spec: Search Input Component with Voice Toggle
> Created: 2026-02-04
> Status: Planning

## Overview

Extract the search input UI from App.tsx into a reusable, well-structured `SearchInput` component with proper Lucide icons, keyboard shortcuts, and accessibility features.

## User Stories

### Field Sales Voice Search

As an RSM in the field, I want to tap a microphone button and speak a camera model number, so that I can quickly look up replacements without typing on my phone.

The voice button should provide clear visual feedback when listening (color change, animation) so I know when to speak. After speaking, the text should appear in the input field and trigger search automatically.

### Quick Keyboard Search

As a user at a desktop, I want to press Enter after typing a model number, so that the search executes immediately without needing to wait for debounce.

The input should also support Escape to clear the current query and results.

## Spec Scope

1. **SearchInput Component** - Standalone component in `src/components/SearchInput.tsx` with typed props
2. **Lucide Icons** - Replace emoji microphone with Lucide `Mic` and `MicOff` icons
3. **Keyboard Shortcuts** - Enter to search, Escape to clear
4. **Visual Feedback** - Listening state animation, focus states, loading indicator
5. **Accessibility** - Proper ARIA labels, keyboard navigation, screen reader support

## Out of Scope

- Search results display (separate component)
- Voice recognition logic changes (useVoice hook is complete)
- Search algorithm changes (useSearch hook is complete)
- Mobile-specific touch gestures

## Expected Deliverable

1. User can type in search input and see results after debounce delay
2. User can press Enter to search immediately
3. User can press Escape to clear input and results
4. User can click mic button to start voice input, see visual feedback while listening
5. Component passes all new tests

## Spec Documentation

- Tasks: @.agent-os/specs/2026-02-04-search-input-component/tasks.md
- Technical Specification: @.agent-os/specs/2026-02-04-search-input-component/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2026-02-04-search-input-component/sub-specs/tests.md
