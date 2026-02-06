/**
 * CategoryFilter Component
 *
 * Filter pills for narrowing search results by manufacturer category.
 * Matches v2 production app visual design.
 *
 * Migrated to Fluent UI components.
 */

import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { CategoryId } from '@/types';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    borderRadius: tokens.borderRadiusMedium,
    border: 'none',
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
  },
  filterButtonActive: {
    backgroundColor: axisTokens.primary,
    color: '#000',
  },
  filterButtonInactive: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
  emoji: {},
  label: {},
  countBadge: {
    padding: '0.125rem 0.375rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    minWidth: '1.25rem',
    textAlign: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: '#000',
  },
  countBadgeInactive: {
    backgroundColor: tokens.colorNeutralStroke1,
    color: tokens.colorNeutralForeground3,
  },
});

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
  { id: 'all', label: 'All', emoji: '\uD83D\uDD0D' },
  { id: 'ndaa', label: 'NDAA', emoji: '\uD83D\uDEAB' },
  { id: 'cloud', label: 'Cloud', emoji: '\u2601\uFE0F' },
  { id: 'defunct', label: 'Bankrupt', emoji: '\uD83D\uDC80' },
  { id: 'family', label: 'Family', emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67' },
  { id: 'competitive', label: 'Competitive', emoji: '\u2694\uFE0F' },
  { id: 'korean', label: 'Korean', emoji: '\uD83C\uDDF0\uD83C\uDDF7' },
  { id: 'japanese', label: 'Japanese', emoji: '\uD83C\uDDEF\uD83C\uDDF5' },
  { id: 'motorola', label: 'Motorola', emoji: '\uD83D\uDCFB' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  resultCounts,
}: CategoryFilterProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {FILTER_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = resultCounts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`${styles.filterButton} ${
              isActive ? styles.filterButtonActive : styles.filterButtonInactive
            }`}
          >
            <span className={styles.emoji}>{cat.emoji}</span>
            <span className={styles.label}>{cat.label}</span>
            {count > 0 && (
              <span
                className={`${styles.countBadge} ${
                  isActive ? styles.countBadgeActive : styles.countBadgeInactive
                }`}
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
