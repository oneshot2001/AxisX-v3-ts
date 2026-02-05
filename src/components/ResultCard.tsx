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

  /** Callback when "Add to BOM" is clicked with quantity */
  onAddToCart: (quantity?: number) => void;
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

/**
 * Get "Why Switch" selling points based on category
 */
function getWhySwitchPoints(category: string): string[] {
  const points: string[] = [];

  // Category-specific points
  switch (category) {
    case 'ndaa':
      points.push('NDAA Section 889 compliant - required for federal contracts');
      points.push('No mandatory cloud subscription - own your data');
      break;
    case 'cloud':
      points.push('One-time purchase, no recurring subscription fees');
      points.push('No forced cloud dependency - local storage options');
      break;
  }

  // Universal Axis advantages
  points.push('Open platform - works with any ONVIF-compatible VMS');
  points.push('Edge analytics included at no additional cost');

  return points;
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
      {!isLegacy && (competitorResolution || competitorType) && (
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
              Axis Replacement
            </div>
            <div style={{ fontWeight: 500 }}>
              {competitorResolution || '—'} equivalent
            </div>
          </div>
        </div>
      )}

      {/* Key Features - shown as pill badges */}
      {axisFeatures && axisFeatures.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div
            style={{
              fontSize: theme.typography.fontSizes.xs,
              color: theme.colors.textMuted,
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}
          >
            Key Features
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {axisFeatures.map((feature, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.5rem',
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: 'rgba(255, 204, 51, 0.15)',
                  border: '1px solid rgba(255, 204, 51, 0.3)',
                  color: theme.colors.primary,
                  fontSize: theme.typography.fontSizes.xs,
                  fontWeight: 500,
                }}
              >
                + {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Why Switch Section */}
      {!isLegacy && (
        <div
          style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderRadius: theme.borderRadius.sm,
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: theme.typography.fontSizes.xs,
              color: theme.colors.success,
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}
          >
            Why Switch to Axis?
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.25rem',
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {getWhySwitchPoints(result.category).map((point, index) => (
              <li key={index} style={{ marginBottom: '0.25rem' }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes Callout - Yellow highlighted for migration notes */}
      {notes && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '0.75rem',
            backgroundColor: 'rgba(234, 179, 8, 0.12)',
            borderRadius: theme.borderRadius.sm,
            borderLeft: `3px solid ${theme.colors.warning}`,
            border: '1px solid rgba(234, 179, 8, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSizes.sm,
                fontWeight: 600,
                color: theme.colors.warning,
                flexShrink: 0,
              }}
            >
              💡 Migration Note:
            </span>
            <span
              style={{
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.textPrimary,
                lineHeight: 1.4,
              }}
            >
              {notes}
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
          onClick={() => onAddToCart(1)}
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
          + Add to BOM
        </button>
      </div>

      {/* Quick Add Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontSize: theme.typography.fontSizes.xs,
          color: theme.colors.textMuted,
        }}>
          Quick add:
        </span>
        {[1, 2, 4, 8, 16].map((qty) => (
          <button
            key={qty}
            onClick={() => onAddToCart(qty)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: 'transparent',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: theme.typography.fontSizes.xs,
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary;
              e.currentTarget.style.color = theme.colors.primary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
              e.currentTarget.style.color = theme.colors.textSecondary;
            }}
          >
            +{qty}
          </button>
        ))}
      </div>
    </div>
  );
}
