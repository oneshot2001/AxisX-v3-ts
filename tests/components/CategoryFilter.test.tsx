/**
 * CategoryFilter Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from '@/components/CategoryFilter';
import type { CategoryId } from '@/types';

describe('CategoryFilter', () => {
  const defaultCounts: Record<CategoryId, number> = {
    all: 15,
    ndaa: 5,
    cloud: 3,
    korean: 2,
    japanese: 1,
    motorola: 2,
    taiwan: 1,
    competitive: 1,
    family: 0,
    defunct: 0,
    'legacy-axis': 0,
  };

  it('renders all visible category buttons', () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryFilter
        activeCategory="all"
        onCategoryChange={onCategoryChange}
        resultCounts={defaultCounts}
      />
    );

    // Main categories should be visible
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ndaa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cloud/i })).toBeInTheDocument();
  });

  it('highlights the active category', () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryFilter
        activeCategory="ndaa"
        onCategoryChange={onCategoryChange}
        resultCounts={defaultCounts}
      />
    );

    const ndaaButton = screen.getByRole('button', { name: /ndaa/i });
    // Active button should have primary background color style
    expect(ndaaButton).toHaveStyle({ backgroundColor: '#FFCC33' });
  });

  it('calls onCategoryChange when button clicked', () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryFilter
        activeCategory="all"
        onCategoryChange={onCategoryChange}
        resultCounts={defaultCounts}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cloud/i }));
    expect(onCategoryChange).toHaveBeenCalledWith('cloud');
  });

  it('displays result counts in badges', () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryFilter
        activeCategory="all"
        onCategoryChange={onCategoryChange}
        resultCounts={defaultCounts}
      />
    );

    // Should show count for all (15)
    expect(screen.getByText('15')).toBeInTheDocument();
    // Should show count for ndaa (5)
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles zero counts gracefully', () => {
    const onCategoryChange = vi.fn();
    const zeroCounts: Record<CategoryId, number> = {
      ...defaultCounts,
      all: 0,
      ndaa: 0,
    };

    render(
      <CategoryFilter
        activeCategory="all"
        onCategoryChange={onCategoryChange}
        resultCounts={zeroCounts}
      />
    );

    // Should still render buttons even with zero counts
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
  });

  it('does not highlight inactive categories', () => {
    const onCategoryChange = vi.fn();
    render(
      <CategoryFilter
        activeCategory="ndaa"
        onCategoryChange={onCategoryChange}
        resultCounts={defaultCounts}
      />
    );

    const allButton = screen.getByRole('button', { name: /all/i });
    // Inactive button should NOT have primary background
    expect(allButton).not.toHaveStyle({ backgroundColor: '#FFCC33' });
  });
});
