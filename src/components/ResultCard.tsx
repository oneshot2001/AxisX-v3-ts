/**
 * ResultCard Component
 *
 * Displays a single search result with competitor→Axis replacement flow,
 * match score, MSRP, and action buttons.
 */

import type { SearchResult, CompetitorMapping, LegacyAxisMapping } from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { theme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface ResultCardProps {
  /** The search result to display */
  result: SearchResult;

  /** Callback when "Add to Cart" is clicked */
  onAddToCart: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get background color for manufacturer badge based on category
 */
function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case 'ndaa':
      return theme.colors.ndaa;
    case 'cloud':
      return theme.colors.cloud;
    case 'legacy-axis':
      return theme.colors.primary;
    default:
      return theme.colors.bgAlt;
  }
}

/**
 * Get text color for manufacturer badge based on category
 */
function getCategoryTextColor(category: string): string {
  switch (category) {
    case 'ndaa':
    case 'cloud':
      return '#fff';
    case 'legacy-axis':
      return '#000';
    default:
      return theme.colors.textPrimary;
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ResultCard({ result, onAddToCart }: ResultCardProps) {
  const mapping = result.mapping;
  const isLegacy = result.isLegacy;

  // Extract model info based on mapping type
  const competitorModel = isLegacy
    ? (mapping as LegacyAxisMapping).legacy_model
    : (mapping as CompetitorMapping).competitor_model;

  const axisModel = isLegacy
    ? (mapping as LegacyAxisMapping).replacement_model
    : (mapping as CompetitorMapping).axis_replacement;

  const manufacturer = isLegacy
    ? 'Axis (Legacy)'
    : (mapping as CompetitorMapping).competitor_manufacturer;

  // Get MSRP for the Axis model
  const msrpDisplay = getFormattedPrice(axisModel);

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
        borderLeft: `4px solid ${theme.colors.primary}`,
        backgroundColor: theme.colors.bgCard,
      }}
    >
      {/* Header: Manufacturer badge + competitor model + score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: getCategoryBadgeColor(result.category),
              color: getCategoryTextColor(result.category),
              fontSize: theme.typography.fontSizes.xs,
              fontWeight: 600,
              marginRight: '0.5rem',
            }}
          >
            {manufacturer}
          </span>
          <span style={{ fontWeight: 600 }}>{competitorModel}</span>
        </div>
        <span
          style={{
            fontSize: theme.typography.fontSizes.sm,
            color: result.score >= 90 ? theme.colors.success : theme.colors.warning,
          }}
        >
          {result.score}% match
        </span>
      </div>

      {/* Arrow + Axis model */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ color: theme.colors.primary, fontWeight: 700 }}>→</span>
        <span
          style={{
            backgroundColor: theme.colors.primary,
            color: '#000',
            padding: '0.25rem 0.5rem',
            borderRadius: theme.borderRadius.sm,
            fontWeight: 600,
          }}
        >
          AXIS
        </span>
        <span style={{ fontWeight: 700, color: theme.colors.primary }}>
          {axisModel}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: theme.typography.fontSizes.sm,
            color: theme.colors.textMuted,
          }}
        >
          {msrpDisplay}
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a
          href={result.axisUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.primary}`,
            color: theme.colors.primary,
            textDecoration: 'none',
            fontSize: theme.typography.fontSizes.sm,
            fontWeight: 500,
          }}
        >
          View on Axis.com
        </a>
        <button
          onClick={onAddToCart}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: theme.borderRadius.sm,
            border: 'none',
            backgroundColor: theme.colors.primary,
            color: '#000',
            cursor: 'pointer',
            fontSize: theme.typography.fontSizes.sm,
            fontWeight: 500,
          }}
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
}
