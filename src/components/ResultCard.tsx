/**
 * ResultCard Component
 *
 * Displays a single search result with:
 * - Competitor → Axis replacement flow
 * - Two-column spec comparison
 * - Notes section
 * - Confidence badge (HIGH/MEDIUM)
 * - Action buttons
 */

import { CheckCircle, AlertCircle } from 'lucide-react';
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

  // Extract spec comparison data (competitor mapping only)
  const competitorMapping = isLegacy ? null : (mapping as CompetitorMapping);
  const competitorResolution = competitorMapping?.competitor_resolution;
  const competitorType = competitorMapping?.competitor_type;
  const axisFeatures = competitorMapping?.axis_features;
  const notes = mapping.notes;

  // Get MSRP for the Axis model
  const msrpDisplay = getFormattedPrice(axisModel);

  // Confidence badge logic
  const isHighConfidence = result.score >= 85;

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
      {/* Header: Manufacturer badge + competitor model + confidence badge */}
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

        {/* Confidence Badge */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: isHighConfidence ? theme.colors.success : theme.colors.warning,
            color: '#fff',
            fontSize: theme.typography.fontSizes.xs,
            fontWeight: 600,
          }}
        >
          {isHighConfidence ? (
            <CheckCircle size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
          {isHighConfidence ? 'HIGH' : 'MEDIUM'}
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
        <span style={{ color: theme.colors.primary, fontWeight: 700, fontSize: '1.25rem' }}>→</span>
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
        <span style={{ fontWeight: 700, color: theme.colors.primary, fontSize: '1.125rem' }}>
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

      {/* Spec Comparison Grid - only show if we have spec data */}
      {!isLegacy && (competitorResolution || competitorType || axisFeatures) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          {/* Competitor Specs */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.bgAlt,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSizes.xs,
                color: theme.colors.textMuted,
                marginBottom: '0.25rem',
              }}
            >
              Legacy
            </div>
            <div style={{ fontWeight: 500 }}>
              {competitorResolution || '—'} • {competitorType || '—'}
            </div>
          </div>

          {/* Axis Specs */}
          <div
            style={{
              padding: '0.75rem',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: 'rgba(255, 204, 51, 0.1)',
              border: `1px solid rgba(255, 204, 51, 0.5)`,
            }}
          >
            <div
              style={{
                fontSize: theme.typography.fontSizes.xs,
                color: theme.colors.primary,
                marginBottom: '0.25rem',
              }}
            >
              Axis
            </div>
            <div style={{ fontWeight: 500 }}>
              {axisFeatures && axisFeatures.length > 0
                ? axisFeatures.slice(0, 3).join(', ')
                : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {notes && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '0.75rem',
            backgroundColor: 'rgba(39, 39, 42, 0.5)',
            borderRadius: theme.borderRadius.sm,
            borderLeft: `2px solid ${theme.colors.primary}`,
          }}
        >
          <span style={{ fontWeight: 600 }}>Notes:</span>{' '}
          <span style={{ color: theme.colors.textSecondary }}>{notes}</span>
        </div>
      )}

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
