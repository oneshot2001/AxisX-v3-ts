/**
 * AccessoryPanel Component
 *
 * Expandable panel showing compatible accessories for an Axis camera.
 * Displays filter tabs, recommendation badges, MSRP, and "Add to BOM" actions.
 */

import { memo, useState, useMemo, useCallback } from 'react';
import {
  Button,
  Text,
  makeStyles,
  tokens,
  TabList,
  Tab,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Warning24Regular,
  Star24Filled,
} from '@fluentui/react-icons';
import type { AccessoryCompatEntry, AccessoryType } from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  panel: {
    padding: '0.75rem',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  header: {
    marginBottom: '0.5rem',
  },
  tabList: {
    marginBottom: '0.75rem',
  },
  accessoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  accessoryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  accessoryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    flex: 1,
    minWidth: 0,
  },
  accessoryNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    flexWrap: 'wrap',
  },
  accessoryName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
  recommendedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.125rem',
    padding: '0.0625rem 0.375rem',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: axisTokens.success,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  accessoryDescription: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  requiresWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.125rem',
    fontSize: tokens.fontSizeBase100,
    color: axisTokens.warning,
    fontWeight: tokens.fontWeightMedium,
  },
  accessoryActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: '0.75rem',
    flexShrink: 0,
  },
  msrp: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  emptyState: {
    padding: '1rem',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

// =============================================================================
// TYPES
// =============================================================================

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'mount', label: 'Mounts' },
  { value: 'power', label: 'Power' },
  { value: 'cables-connectors', label: 'Cables' },
  { value: 'housings-cabinets', label: 'Housings' },
  { value: 'edge-storage', label: 'Storage' },
  { value: 'switches', label: 'Switches' },
  { value: 'tools-extras', label: 'Tools' },
];

export interface AccessoryPanelProps {
  /** Camera model for display */
  readonly cameraModel: string;
  /** Compatible accessories to display */
  readonly accessories: readonly AccessoryCompatEntry[];
  /** Callback when "Add to BOM" is clicked */
  readonly onAddToCart: (accessory: AccessoryCompatEntry) => void;
  /** Set of accessory model keys already in cart */
  readonly cartAccessoryModels?: ReadonlySet<string>;
}

// =============================================================================
// COMPONENT
// =============================================================================

function AccessoryPanelComponent({
  cameraModel,
  accessories,
  onAddToCart,
  cartAccessoryModels,
}: AccessoryPanelProps) {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState('all');

  const filteredAccessories = useMemo(() => {
    if (selectedTab === 'all') return accessories;
    return accessories.filter(
      (acc) => acc.accessoryType === (selectedTab as AccessoryType)
    );
  }, [accessories, selectedTab]);

  // Only show tabs that have accessories
  const availableTabs = useMemo(() => {
    const typesPresent = new Set(accessories.map((a) => a.accessoryType));
    return FILTER_TABS.filter(
      (tab) => tab.value === 'all' || typesPresent.has(tab.value as AccessoryType)
    );
  }, [accessories]);

  const handleTabSelect = useCallback(
    (_: unknown, data: { value: unknown }) => {
      setSelectedTab(String(data.value));
    },
    []
  );

  return (
    <div className={styles.panel} data-testid="accessory-panel">
      <Text
        className={styles.header}
        weight="semibold"
        size={200}
        block
      >
        Accessories for AXIS {cameraModel}
      </Text>

      {availableTabs.length > 1 && (
        <TabList
          className={styles.tabList}
          selectedValue={selectedTab}
          onTabSelect={handleTabSelect}
          size="small"
        >
          {availableTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
      )}

      {filteredAccessories.length === 0 ? (
        <div className={styles.emptyState}>
          <Text>No accessories found</Text>
        </div>
      ) : (
        <div className={styles.accessoryList}>
          {filteredAccessories.map((acc) => {
            const inCart = cartAccessoryModels?.has(acc.model) ?? false;
            const msrp = getMsrpDisplay(acc.msrpKey);

            return (
              <div
                key={acc.model}
                className={styles.accessoryRow}
                data-testid={`accessory-row-${acc.model}`}
              >
                <div className={styles.accessoryInfo}>
                  <div className={styles.accessoryNameRow}>
                    <Text className={styles.accessoryName}>
                      {acc.displayName}
                    </Text>
                    {acc.recommendation === 'recommended' && (
                      <span className={styles.recommendedBadge}>
                        <Star24Filled style={{ width: 10, height: 10 }} />
                        Recommended
                      </span>
                    )}
                  </div>
                  <Text className={styles.accessoryDescription}>
                    {acc.description}
                  </Text>
                  {acc.requiresAdditional && (
                    <span className={styles.requiresWarning}>
                      <Warning24Regular style={{ width: 12, height: 12 }} />
                      Requires additional accessory
                    </span>
                  )}
                </div>

                <div className={styles.accessoryActions}>
                  <Text className={styles.msrp}>{msrp}</Text>
                  <Button
                    appearance="outline"
                    size="small"
                    icon={<Add24Regular />}
                    onClick={() => onAddToCart(acc)}
                    disabled={inCart}
                  >
                    {inCart ? 'In BOM' : 'Add'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getMsrpDisplay(msrpKey?: string): string {
  if (!msrpKey) return 'TBD';
  try {
    return getFormattedPrice(msrpKey);
  } catch {
    return 'TBD';
  }
}

export const AccessoryPanel = memo(AccessoryPanelComponent);
AccessoryPanel.displayName = 'AccessoryPanel';
