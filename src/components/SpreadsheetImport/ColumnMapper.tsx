/**
 * ColumnMapper Component
 *
 * Allows users to map spreadsheet columns to data fields.
 * Shows preview of data based on current mapping.
 */

import {
  Card,
  Text,
  Button,
  Dropdown,
  Option,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  Checkmark24Regular,
  Table24Regular,
} from '@fluentui/react-icons';
import type { SpreadsheetImportResult, SpreadsheetColumnMapping } from '@/types';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  fileIcon: {
    color: axisTokens.primary,
  },
  fileName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  rowCount: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  mappingSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mappingTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '0.5rem',
  },
  mappingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  mappingField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  fieldLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  fieldRequired: {
    color: axisTokens.error,
  },
  fieldOptional: {
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
  },
  previewSection: {
    marginTop: '1rem',
  },
  previewTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '0.75rem',
  },
  previewTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: tokens.fontSizeBase200,
  },
  previewHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
    textAlign: 'left',
    padding: '0.5rem',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    fontWeight: tokens.fontWeightSemibold,
  },
  previewCell: {
    padding: '0.5rem',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  previewHighlight: {
    backgroundColor: `${axisTokens.primary}15`,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface ColumnMapperProps {
  /** Parsed spreadsheet data */
  data: SpreadsheetImportResult;
  /** Current column mapping */
  mapping: SpreadsheetColumnMapping;
  /** Callback to update mapping */
  onMappingChange: (mapping: SpreadsheetColumnMapping) => void;
  /** Callback when user proceeds to validation */
  onProceed: () => void;
  /** Callback when user goes back */
  onBack: () => void;
  /** Whether validation is in progress */
  isProcessing?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ColumnMapper({
  data,
  mapping,
  onMappingChange,
  onProceed,
  onBack,
  isProcessing,
}: ColumnMapperProps) {
  const styles = useStyles();

  // Build column options
  const columnOptions = data.headers.map((header, index) => ({
    key: String(index),
    text: header || `Column ${index + 1}`,
  }));

  // Handle dropdown changes
  const handleModelColumnChange = (_e: unknown, option: { optionValue?: string } | undefined) => {
    if (option?.optionValue !== undefined) {
      onMappingChange({
        ...mapping,
        modelColumn: parseInt(option.optionValue, 10),
      });
    }
  };

  const handleQuantityColumnChange = (_e: unknown, option: { optionValue?: string } | undefined) => {
    if (option?.optionValue === 'none') {
      onMappingChange({
        ...mapping,
        quantityColumn: undefined,
      });
    } else if (option?.optionValue !== undefined) {
      onMappingChange({
        ...mapping,
        quantityColumn: parseInt(option.optionValue, 10),
      });
    }
  };

  const handleManufacturerColumnChange = (
    _e: unknown,
    option: { optionValue?: string } | undefined
  ) => {
    if (option?.optionValue === 'none') {
      onMappingChange({
        ...mapping,
        manufacturerColumn: undefined,
      });
    } else if (option?.optionValue !== undefined) {
      onMappingChange({
        ...mapping,
        manufacturerColumn: parseInt(option.optionValue, 10),
      });
    }
  };

  const handleMountTypeColumnChange = (
    _e: unknown,
    option: { optionValue?: string } | undefined
  ) => {
    if (option?.optionValue === 'none') {
      onMappingChange({
        ...mapping,
        mountTypeColumn: undefined,
      });
    } else if (option?.optionValue !== undefined) {
      onMappingChange({
        ...mapping,
        mountTypeColumn: parseInt(option.optionValue, 10),
      });
    }
  };

  const handleLocationColumnChange = (
    _e: unknown,
    option: { optionValue?: string } | undefined
  ) => {
    if (option?.optionValue === 'none') {
      onMappingChange({
        ...mapping,
        locationColumn: undefined,
      });
    } else if (option?.optionValue !== undefined) {
      onMappingChange({
        ...mapping,
        locationColumn: parseInt(option.optionValue, 10),
      });
    }
  };

  // Preview rows (first 5)
  const previewRows = data.rows.slice(0, 5);

  return (
    <div className={styles.container}>
      {/* Header with file info */}
      <div className={styles.header}>
        <div className={styles.fileInfo}>
          <Table24Regular className={styles.fileIcon} />
          <Text className={styles.fileName}>{data.filename}</Text>
          <Text className={styles.rowCount}>({data.rowCount} rows)</Text>
        </div>
      </div>

      {/* Mapping section */}
      <Card>
        <div className={styles.mappingSection}>
          <Text className={styles.mappingTitle}>Map Columns</Text>

          <div className={styles.mappingGrid}>
            {/* Model column (required) */}
            <div className={styles.mappingField}>
              <Text className={styles.fieldLabel}>
                Model Number <span className={styles.fieldRequired}>*</span>
              </Text>
              <Dropdown
                value={columnOptions[mapping.modelColumn]?.text ?? ''}
                selectedOptions={[String(mapping.modelColumn)]}
                onOptionSelect={handleModelColumnChange}
              >
                {columnOptions.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.text}
                  </Option>
                ))}
              </Dropdown>
            </div>

            {/* Quantity column (optional) */}
            <div className={styles.mappingField}>
              <Text className={styles.fieldLabel}>
                Quantity <span className={styles.fieldOptional}>(optional)</span>
              </Text>
              <Dropdown
                value={
                  mapping.quantityColumn !== undefined
                    ? columnOptions[mapping.quantityColumn]?.text ?? ''
                    : 'None'
                }
                selectedOptions={[
                  mapping.quantityColumn !== undefined
                    ? String(mapping.quantityColumn)
                    : 'none',
                ]}
                onOptionSelect={handleQuantityColumnChange}
              >
                <Option value="none">None (default to 1)</Option>
                {columnOptions.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.text}
                  </Option>
                ))}
              </Dropdown>
            </div>

            {/* Manufacturer column (optional) */}
            <div className={styles.mappingField}>
              <Text className={styles.fieldLabel}>
                Manufacturer <span className={styles.fieldOptional}>(optional)</span>
              </Text>
              <Dropdown
                value={
                  mapping.manufacturerColumn !== undefined
                    ? columnOptions[mapping.manufacturerColumn]?.text ?? ''
                    : 'None'
                }
                selectedOptions={[
                  mapping.manufacturerColumn !== undefined
                    ? String(mapping.manufacturerColumn)
                    : 'none',
                ]}
                onOptionSelect={handleManufacturerColumnChange}
              >
                <Option value="none">None</Option>
                {columnOptions.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.text}
                  </Option>
                ))}
              </Dropdown>
            </div>

            {/* Mount Type column (optional) */}
            <div className={styles.mappingField}>
              <Text className={styles.fieldLabel}>
                Mount Type <span className={styles.fieldOptional}>(optional)</span>
              </Text>
              <Dropdown
                value={
                  mapping.mountTypeColumn !== undefined
                    ? columnOptions[mapping.mountTypeColumn]?.text ?? ''
                    : 'None'
                }
                selectedOptions={[
                  mapping.mountTypeColumn !== undefined
                    ? String(mapping.mountTypeColumn)
                    : 'none',
                ]}
                onOptionSelect={handleMountTypeColumnChange}
              >
                <Option value="none">None</Option>
                {columnOptions.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.text}
                  </Option>
                ))}
              </Dropdown>
            </div>

            {/* Location column (optional) */}
            <div className={styles.mappingField}>
              <Text className={styles.fieldLabel}>
                Location <span className={styles.fieldOptional}>(optional)</span>
              </Text>
              <Dropdown
                value={
                  mapping.locationColumn !== undefined
                    ? columnOptions[mapping.locationColumn]?.text ?? ''
                    : 'None'
                }
                selectedOptions={[
                  mapping.locationColumn !== undefined
                    ? String(mapping.locationColumn)
                    : 'none',
                ]}
                onOptionSelect={handleLocationColumnChange}
              >
                <Option value="none">None</Option>
                {columnOptions.map((opt) => (
                  <Option key={opt.key} value={opt.key}>
                    {opt.text}
                  </Option>
                ))}
              </Dropdown>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview section */}
      <div className={styles.previewSection}>
        <Text className={styles.previewTitle}>Preview (first 5 rows)</Text>
        <Card>
          <table className={styles.previewTable}>
            <thead>
              <tr>
                <th className={styles.previewHeader}>Row</th>
                {data.headers.map((header, idx) => (
                  <th
                    key={idx}
                    className={`${styles.previewHeader} ${
                      idx === mapping.modelColumn ||
                      idx === mapping.quantityColumn ||
                      idx === mapping.manufacturerColumn ||
                      idx === mapping.mountTypeColumn ||
                      idx === mapping.locationColumn
                        ? styles.previewHighlight
                        : ''
                    }`}
                  >
                    {header || `Col ${idx + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className={styles.previewCell}>{rowIdx + 1}</td>
                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={`${styles.previewCell} ${
                        colIdx === mapping.modelColumn ||
                        colIdx === mapping.quantityColumn ||
                        colIdx === mapping.manufacturerColumn
                          ? styles.previewHighlight
                          : ''
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack}>
          Back
        </Button>
        <Button
          appearance="primary"
          icon={<Checkmark24Regular />}
          onClick={onProceed}
          disabled={isProcessing}
        >
          {isProcessing ? 'Validating...' : 'Validate & Import'}
        </Button>
      </div>
    </div>
  );
}
