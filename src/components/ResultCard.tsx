/**
 * ResultCard Component
 *
 * Displays a single search result with:
 * - Competitor -> Axis replacement flow
 * - Two-column spec comparison
 * - Notes section
 * - Confidence badge (HIGH/MEDIUM)
 * - Action buttons
 *
 * Migrated to Fluent UI components.
 */

import { memo, useState, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Text,
  makeStyles,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  Warning24Filled,
  Open24Regular,
  Add24Regular,
  Lightbulb24Regular,
  ChevronDown24Regular,
  ChevronUp24Regular,
} from '@fluentui/react-icons';
import type { SearchResult, CompetitorMapping, LegacyAxisMapping, AccessoryCompatEntry } from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { lookupSpec } from '@/core/specs';
import { useAccessory } from '@/hooks/useAccessory';
import { AccessoryPanel } from './AccessoryPanel';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  card: {
    padding: '1rem',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: axisTokens.primary,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  manufacturerBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  ndaaBadge: {
    backgroundColor: axisTokens.ndaa,
    color: '#fff',
  },
  cloudBadge: {
    backgroundColor: axisTokens.cloud,
    color: '#fff',
  },
  legacyBadge: {
    backgroundColor: axisTokens.primary,
    color: '#000',
  },
  defaultBadge: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  confidenceBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    color: '#fff',
  },
  highConfidence: {
    backgroundColor: axisTokens.success,
  },
  mediumConfidence: {
    backgroundColor: axisTokens.warning,
  },
  arrowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  arrow: {
    color: axisTokens.primary,
    fontWeight: tokens.fontWeightBold,
    fontSize: '1.25rem',
  },
  axisBadge: {
    backgroundColor: axisTokens.primary,
    color: '#000',
    padding: '0.25rem 0.5rem',
    borderRadius: tokens.borderRadiusSmall,
    fontWeight: tokens.fontWeightSemibold,
  },
  axisModel: {
    fontWeight: tokens.fontWeightBold,
    color: axisTokens.primary,
    fontSize: '1.125rem',
  },
  msrp: {
    marginLeft: 'auto',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  specSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(255, 204, 51, 0.06)',
    borderRadius: tokens.borderRadiusSmall,
    border: '1px solid rgba(255, 204, 51, 0.15)',
  },
  specPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.5rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
  specPillLabel: {
    fontWeight: tokens.fontWeightSemibold,
    marginRight: '0.25rem',
    color: tokens.colorNeutralForeground3,
  },
  specGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  specCard: {
    padding: '0.75rem',
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  specCardLegacy: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  specCardAxis: {
    backgroundColor: 'rgba(255, 204, 51, 0.1)',
    border: '1px solid rgba(255, 204, 51, 0.5)',
  },
  specLabel: {
    fontSize: tokens.fontSizeBase100,
    marginBottom: '0.25rem',
  },
  specValue: {
    fontWeight: tokens.fontWeightMedium,
  },
  featuresSection: {
    marginBottom: '0.75rem',
  },
  featuresLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    marginBottom: '0.5rem',
    fontWeight: tokens.fontWeightSemibold,
  },
  featuresContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  featureBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'rgba(255, 204, 51, 0.15)',
    border: '1px solid rgba(255, 204, 51, 0.3)',
    color: axisTokens.primary,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightMedium,
  },
  whySwitchSection: {
    marginBottom: '0.75rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: tokens.borderRadiusSmall,
    border: '1px solid rgba(34, 197, 94, 0.2)',
  },
  whySwitchLabel: {
    fontSize: tokens.fontSizeBase100,
    color: axisTokens.success,
    marginBottom: '0.5rem',
    fontWeight: tokens.fontWeightSemibold,
  },
  whySwitchList: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
  },
  whySwitchItem: {
    marginBottom: '0.25rem',
  },
  notesSection: {
    padding: '0.75rem',
    marginBottom: '0.75rem',
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderRadius: tokens.borderRadiusSmall,
    borderLeft: `3px solid ${axisTokens.warning}`,
    border: '1px solid rgba(234, 179, 8, 0.25)',
  },
  notesContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  notesLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: axisTokens.warning,
    flexShrink: 0,
  },
  notesText: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: 1.4,
  },
  actionsRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  quickAddRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  quickAddLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  quickAddButton: {
    minWidth: 'auto',
    padding: '0.25rem 0.5rem',
  },
  accessorySection: {
    marginTop: '0.75rem',
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface ResultCardProps {
  /** The search result to display */
  readonly result: SearchResult;

  /** Callback when "Add to BOM" is clicked with quantity */
  readonly onAddToCart: (result: SearchResult, quantity?: number) => void;

  /** Callback when an accessory is added to BOM */
  readonly onAddAccessoryToCart?: (accessory: AccessoryCompatEntry, parentModel: string) => void;

  /** Set of accessory model keys already in cart */
  readonly cartAccessoryModels?: ReadonlySet<string>;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get "Why Switch" selling points based on category
 */
function getWhySwitchPoints(category: string): string[] {
  const points: string[] = [];

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

  points.push('Open platform - works with any ONVIF-compatible VMS');
  points.push('Edge analytics included at no additional cost');

  return points;
}

// =============================================================================
// COMPONENT
// =============================================================================

function ResultCardComponent({ result, onAddToCart, onAddAccessoryToCart, cartAccessoryModels }: ResultCardProps) {
  const styles = useStyles();
  const [showAccessories, setShowAccessories] = useState(false);
  const { getAccessories, isLoaded: accessoryLoaded } = useAccessory();
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

  // Get enriched specs for the Axis model
  let axisSpec: ReturnType<typeof lookupSpec> = null;
  try {
    axisSpec = lookupSpec(axisModel);
  } catch {
    // Specs not initialized yet
  }

  // Accessory data
  const accessories = useMemo(
    () => (accessoryLoaded && showAccessories ? getAccessories(axisModel) : []),
    [accessoryLoaded, showAccessories, getAccessories, axisModel]
  );

  const handleToggleAccessories = useCallback(() => {
    setShowAccessories((prev) => !prev);
  }, []);

  const handleAddAccessory = useCallback(
    (accessory: AccessoryCompatEntry) => {
      onAddAccessoryToCart?.(accessory, axisModel);
    },
    [onAddAccessoryToCart, axisModel]
  );

  // Confidence badge logic
  const isHighConfidence = result.score >= 85;

  // Get manufacturer badge styling
  const getManufacturerBadgeClass = () => {
    switch (result.category) {
      case 'ndaa':
        return mergeClasses(styles.manufacturerBadge, styles.ndaaBadge);
      case 'cloud':
        return mergeClasses(styles.manufacturerBadge, styles.cloudBadge);
      case 'legacy-axis':
        return mergeClasses(styles.manufacturerBadge, styles.legacyBadge);
      default:
        return mergeClasses(styles.manufacturerBadge, styles.defaultBadge);
    }
  };

  return (
    <Card className={styles.card} appearance="outline">
      {/* Header: Manufacturer badge + competitor model + confidence badge */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={getManufacturerBadgeClass()}>
            {manufacturer}
          </span>
          <Text weight="semibold">{competitorModel}</Text>
        </div>

        {/* Confidence Badge */}
        <span
          className={mergeClasses(
            styles.confidenceBadge,
            isHighConfidence ? styles.highConfidence : styles.mediumConfidence
          )}
        >
          {isHighConfidence ? (
            <CheckmarkCircle24Filled style={{ width: 12, height: 12 }} />
          ) : (
            <Warning24Filled style={{ width: 12, height: 12 }} />
          )}
          {isHighConfidence ? 'HIGH' : 'MEDIUM'}
        </span>
      </div>

      {/* Arrow + Axis model */}
      <div className={styles.arrowRow}>
        <span className={styles.arrow}>-&gt;</span>
        <span className={styles.axisBadge}>AXIS</span>
        <span className={styles.axisModel}>{axisModel}</span>
        <span className={styles.msrp}>{msrpDisplay}</span>
      </div>

      {/* Enriched Spec Summary */}
      {axisSpec && (
        <div className={styles.specSummary}>
          {axisSpec.maxResolution && (
            <span className={styles.specPill}>
              <span className={styles.specPillLabel}>Res:</span>
              {axisSpec.maxResolution}
              {axisSpec.resolutionLabel ? ` (${axisSpec.resolutionLabel})` : ''}
            </span>
          )}
          {axisSpec.maxFps && (
            <span className={styles.specPill}>
              <span className={styles.specPillLabel}>FPS:</span>
              {axisSpec.maxFps}
            </span>
          )}
          {axisSpec.codecs.length > 0 && (
            <span className={styles.specPill}>
              <span className={styles.specPillLabel}>Codec:</span>
              {axisSpec.codecs.join(', ')}
            </span>
          )}
          {(axisSpec.powerType || axisSpec.poeTypeClass) && (
            <span className={styles.specPill}>
              <span className={styles.specPillLabel}>PoE:</span>
              {axisSpec.poeTypeClass || axisSpec.powerType}
              {axisSpec.maxPowerWatts ? ` (${axisSpec.maxPowerWatts}W)` : ''}
            </span>
          )}
          {axisSpec.analytics.length > 0 && (
            <span className={styles.specPill}>
              <span className={styles.specPillLabel}>Analytics:</span>
              {axisSpec.analytics.slice(0, 2).join(', ')}
              {axisSpec.analytics.length > 2 ? ` +${axisSpec.analytics.length - 2}` : ''}
            </span>
          )}
        </div>
      )}

      {/* Spec Comparison Grid - only show if we have spec data */}
      {!isLegacy && (competitorResolution || competitorType) && (
        <div className={styles.specGrid}>
          {/* Competitor Specs */}
          <div className={mergeClasses(styles.specCard, styles.specCardLegacy)}>
            <Text className={styles.specLabel} block>
              Legacy
            </Text>
            <Text className={styles.specValue}>
              {competitorResolution || '\u2014'} \u2022 {competitorType || '\u2014'}
            </Text>
          </div>

          {/* Axis Specs */}
          <div className={mergeClasses(styles.specCard, styles.specCardAxis)}>
            <Text className={styles.specLabel} style={{ color: axisTokens.primary }} block>
              Axis Replacement
            </Text>
            <Text className={styles.specValue}>
              {competitorResolution || '\u2014'} equivalent
            </Text>
          </div>
        </div>
      )}

      {/* Key Features - shown as pill badges */}
      {axisFeatures && axisFeatures.length > 0 && (
        <div className={styles.featuresSection}>
          <Text className={styles.featuresLabel} block>
            Key Features
          </Text>
          <div className={styles.featuresContainer}>
            {axisFeatures.map((feature, index) => (
              <span key={index} className={styles.featureBadge}>
                + {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Why Switch Section */}
      {!isLegacy && (
        <div className={styles.whySwitchSection}>
          <Text className={styles.whySwitchLabel} block>
            Why Switch to Axis?
          </Text>
          <ul className={styles.whySwitchList}>
            {getWhySwitchPoints(result.category).map((point, index) => (
              <li key={index} className={styles.whySwitchItem}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes Callout - Yellow highlighted for migration notes */}
      {notes && (
        <div className={styles.notesSection}>
          <div className={styles.notesContent}>
            <span className={styles.notesLabel}>
              <Lightbulb24Regular style={{ width: 16, height: 16, marginRight: 4 }} />
              Migration Note:
            </span>
            <Text className={styles.notesText}>{notes}</Text>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.actionsRow}>
        <Button
          as="a"
          href={result.axisUrl}
          target="_blank"
          rel="noopener noreferrer"
          appearance="outline"
          icon={<Open24Regular />}
        >
          View on Axis.com
        </Button>
        <Button
          onClick={() => onAddToCart(result, 1)}
          appearance="primary"
          icon={<Add24Regular />}
        >
          Add to BOM
        </Button>
      </div>

      {/* Quick Add Buttons */}
      <div className={styles.quickAddRow}>
        <Text className={styles.quickAddLabel}>Quick add:</Text>
        {[1, 2, 4, 8, 16].map((qty) => (
          <Button
            key={qty}
            onClick={() => onAddToCart(result, qty)}
            appearance="outline"
            size="small"
            className={styles.quickAddButton}
          >
            +{qty}
          </Button>
        ))}
      </div>

      {/* Accessories Toggle */}
      {accessoryLoaded && (
        <div className={styles.accessorySection}>
          <Button
            appearance="subtle"
            size="small"
            icon={showAccessories ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
            onClick={handleToggleAccessories}
          >
            {showAccessories ? 'Hide Accessories' : 'Show Accessories'}
          </Button>

          {showAccessories && accessories.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <AccessoryPanel
                cameraModel={axisModel}
                accessories={accessories}
                onAddToCart={handleAddAccessory}
                cartAccessoryModels={cartAccessoryModels}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export const ResultCard = memo(ResultCardComponent, (prev, next) =>
  prev.result === next.result &&
  prev.onAddToCart === next.onAddToCart &&
  prev.onAddAccessoryToCart === next.onAddAccessoryToCart &&
  prev.cartAccessoryModels === next.cartAccessoryModels
);
ResultCard.displayName = 'ResultCard';
