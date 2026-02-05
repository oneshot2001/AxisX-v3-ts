/**
 * CategoryFilter Component
 *
 * Filter pills for narrowing search results by manufacturer category.
 * Matches v2 production app visual design.
 */

import type { CategoryId } from '@/types';
import { theme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface CategoryFilterProps {
  /** Currently active category filter */
  activeCategory: CategoryId;

  /** Callback when category selection changes */
  onCategoryChange: (category: CategoryId) => void;

  /** Result counts per category for badge display */
  resultCounts: Record<CategoryId, number>;
}

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

interface CategoryDef {
  id: CategoryId;
  label: string;
  emoji: string;
}

/**
 * Visible categories for filter UI
 * Ordered by priority/frequency of use
 */
const FILTER_CATEGORIES: CategoryDef[] = [
  { id: 'all', label: 'All', emoji: '🔍' },
  { id: 'ndaa', label: 'NDAA', emoji: '🚫' },
  { id: 'cloud', label: 'Cloud', emoji: '☁️' },
  { id: 'defunct', label: 'Bankrupt', emoji: '💀' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'competitive', label: 'Competitive', emoji: '⚔️' },
  { id: 'korean', label: 'Korean', emoji: '🇰🇷' },
  { id: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
  { id: 'motorola', label: 'Motorola', emoji: '📻' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  resultCounts,
}: CategoryFilterProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        marginBottom: '1rem',
      }}
    >
      {FILTER_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = resultCounts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              borderRadius: theme.borderRadius.md,
              border: 'none',
              cursor: 'pointer',
              fontSize: theme.typography.fontSizes.sm,
              fontWeight: 500,
              backgroundColor: isActive ? theme.colors.primary : theme.colors.bgAlt,
              color: isActive ? '#000' : theme.colors.textSecondary,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span
                style={{
                  backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : theme.colors.border,
                  color: isActive ? '#000' : theme.colors.textMuted,
                  padding: '0.125rem 0.375rem',
                  borderRadius: theme.borderRadius.full,
                  fontSize: theme.typography.fontSizes.xs,
                  fontWeight: 600,
                  minWidth: '1.25rem',
                  textAlign: 'center',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
