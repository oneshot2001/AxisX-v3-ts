/**
 * AxisBrowseResults Component
 *
 * Renders the full Axis Communications portfolio as a categorized, browsable view.
 * Triggered when the user types "Axis" in the search bar (queryType: axis-browse).
 *
 * Categories are organized by camera type (Dome, Bullet, Box, PTZ, etc.) with
 * series groupings and individual model rows showing MSRP, Axis.com links,
 * and Add to BOM buttons.
 */

import { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Open16Regular,
  Add16Regular,
} from '@fluentui/react-icons';
import { AXIS_CATALOG, getCatalogModelCount } from '@/data/axisCatalog';
import type { CatalogCategory, CatalogSeries } from '@/data/axisCatalog';
import { getFormattedPrice } from '@/core/msrp';
import { getAxisURL } from '@/core/url';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {},
  header: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerTitle: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  modelCountBadge: {
    backgroundColor: axisTokens.primary,
    color: '#000',
    padding: '0.125rem 0.5rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  categoryHeader: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: axisTokens.primary,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  categoryHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  categoryTitle: {
    fontWeight: tokens.fontWeightSemibold,
  },
  categoryCount: {
    color: '#fff',
    backgroundColor: axisTokens.primary,
    padding: '0.125rem 0.5rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  categoryDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginLeft: '0.5rem',
  },
  accordionItem: {
    marginBottom: '0.75rem',
  },
  accordionPanel: {
    paddingTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  seriesGroup: {
    marginBottom: '0.25rem',
  },
  seriesHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  seriesLabel: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  seriesDescription: {
    fontStyle: 'italic',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  modelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  modelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.5rem',
    borderRadius: tokens.borderRadiusSmall,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  modelName: {
    fontWeight: tokens.fontWeightSemibold,
    color: axisTokens.primary,
    minWidth: '120px',
  },
  modelMsrp: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    minWidth: '80px',
  },
  modelActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '0.25rem',
  },
});

// =============================================================================
// HELPERS
// =============================================================================

function getCategoryModelCount(category: CatalogCategory): number {
  return category.series.reduce((sum, s) => sum + s.models.length, 0);
}

function getModelUrl(model: string): string {
  return getAxisURL(model);
}

// =============================================================================
// TYPES
// =============================================================================

export interface AxisBrowseResultsProps {
  onAddToCart: (model: string, quantity: number) => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SeriesGroup({
  series,
  onAddToCart,
}: {
  series: CatalogSeries;
  onAddToCart: (model: string, quantity: number) => void;
}) {
  const styles = useStyles();

  return (
    <div className={styles.seriesGroup}>
      <div className={styles.seriesHeader}>
        <Text className={styles.seriesLabel}>{series.label}</Text>
        <Text className={styles.seriesDescription}>{series.description}</Text>
      </div>
      <div className={styles.modelList}>
        {series.models.map((model) => (
          <div key={model} className={styles.modelRow}>
            <Text className={styles.modelName}>{model}</Text>
            <Text className={styles.modelMsrp}>{getFormattedPrice(model)}</Text>
            <div className={styles.modelActions}>
              <Button
                as="a"
                href={getModelUrl(model)}
                target="_blank"
                rel="noopener noreferrer"
                appearance="subtle"
                size="small"
                icon={<Open16Regular />}
              >
                Axis.com
              </Button>
              <Button
                onClick={() => onAddToCart(model, 1)}
                appearance="subtle"
                size="small"
                icon={<Add16Regular />}
              >
                Add to BOM
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AxisBrowseResults({ onAddToCart }: AxisBrowseResultsProps) {
  const styles = useStyles();
  const totalModels = getCatalogModelCount();

  // All categories expanded by default
  const [openItems, setOpenItems] = useState<string[]>(
    () => AXIS_CATALOG.map((c) => c.id)
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Text className={styles.headerTitle}>Axis Communications Portfolio</Text>
        <span className={styles.modelCountBadge}>{totalModels} models</span>
      </div>

      {/* Category Accordion */}
      <Accordion
        multiple
        collapsible
        openItems={openItems}
        onToggle={(_, data) => setOpenItems(data.openItems as string[])}
      >
        {AXIS_CATALOG.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className={styles.accordionItem}
          >
            <AccordionHeader className={styles.categoryHeader}>
              <div className={styles.categoryHeaderContent}>
                <Text className={styles.categoryTitle}>{category.label}</Text>
                <span className={styles.categoryCount}>
                  {getCategoryModelCount(category)}
                </span>
                <Text className={styles.categoryDescription}>
                  {category.description}
                </Text>
              </div>
            </AccordionHeader>
            <AccordionPanel className={styles.accordionPanel}>
              {category.series.map((series) => (
                <SeriesGroup
                  key={series.id}
                  series={series}
                  onAddToCart={onAddToCart}
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
