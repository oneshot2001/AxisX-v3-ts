/**
 * SearchInput Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/SearchInput';

describe('SearchInput', () => {
  // ==========================================================================
  // BASIC RENDERING
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('renders input with placeholder text', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Search cameras..."
        />
      );

      expect(screen.getByPlaceholderText('Search cameras...')).toBeInTheDocument();
    });

    it('renders input with provided value', () => {
      render(
        <SearchInput
          value="P3245-V"
          onChange={() => {}}
        />
      );

      expect(screen.getByDisplayValue('P3245-V')).toBeInTheDocument();
    });

    it('uses default placeholder when not provided', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // CHANGE HANDLING
  // ==========================================================================

  describe('Change Handling', () => {
    it('calls onChange when user types', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <SearchInput
          value=""
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'H');

      expect(handleChange).toHaveBeenCalledWith('H');
    });
  });

  // ==========================================================================
  // KEYBOARD HANDLING
  // ==========================================================================

  describe('Keyboard Handling', () => {
    it('calls onSearch when Enter is pressed', () => {
      const handleSearch = vi.fn();

      render(
        <SearchInput
          value="test"
          onChange={() => {}}
          onSearch={handleSearch}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleSearch).toHaveBeenCalledTimes(1);
    });

    it('calls onClear when Escape is pressed', () => {
      const handleClear = vi.fn();

      render(
        <SearchInput
          value="test"
          onChange={() => {}}
          onClear={handleClear}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('does not call onSearch when callback not provided', () => {
      // Should not throw when Enter pressed without onSearch
      render(
        <SearchInput
          value="test"
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(() => fireEvent.keyDown(input, { key: 'Enter' })).not.toThrow();
    });

    it('does not call onClear when callback not provided', () => {
      // Should not throw when Escape pressed without onClear
      render(
        <SearchInput
          value="test"
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(() => fireEvent.keyDown(input, { key: 'Escape' })).not.toThrow();
    });
  });

  // ==========================================================================
  // VOICE BUTTON
  // ==========================================================================

  describe('Voice Button', () => {
    it('renders voice button when voice.enabled is true', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          voice={{
            enabled: true,
            isListening: false,
            onToggle: () => {},
          }}
        />
      );

      expect(screen.getByRole('button', { name: /voice/i })).toBeInTheDocument();
    });

    it('hides voice button when voice.enabled is false', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          voice={{
            enabled: false,
            isListening: false,
            onToggle: () => {},
          }}
        />
      );

      expect(screen.queryByRole('button', { name: /voice/i })).not.toBeInTheDocument();
    });

    it('hides voice button when voice prop not provided', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.queryByRole('button', { name: /voice/i })).not.toBeInTheDocument();
    });

    it('calls voice.onToggle when voice button clicked', async () => {
      const handleToggle = vi.fn();
      const user = userEvent.setup();

      render(
        <SearchInput
          value=""
          onChange={() => {}}
          voice={{
            enabled: true,
            isListening: false,
            onToggle: handleToggle,
          }}
        />
      );

      const button = screen.getByRole('button', { name: /voice/i });
      await user.click(button);

      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('shows listening state when voice.isListening is true', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          voice={{
            enabled: true,
            isListening: true,
            onToggle: () => {},
          }}
        />
      );

      const button = screen.getByRole('button', { name: /voice/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows idle state when not listening', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          voice={{
            enabled: true,
            isListening: false,
            onToggle: () => {},
          }}
        />
      );

      const button = screen.getByRole('button', { name: /voice/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  describe('Loading State', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          isLoading={true}
        />
      );

      // Fluent UI Spinner uses role="progressbar"
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('hides loading indicator when isLoading is false', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          isLoading={false}
        />
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    it('has correct aria-label on input', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label');
    });

    it('input is focusable', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('auto-focuses input when autoFocus is true', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          autoFocus={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(document.activeElement).toBe(input);
    });
  });
});
