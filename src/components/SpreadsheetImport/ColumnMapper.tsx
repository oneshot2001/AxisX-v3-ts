/**
 * ColumnMapper — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer
 * Motion + lucide-react).
 *
 * Layout:
 *   [file pill]   Sheet name + row count chip
 *   [mapping]     Two-column field table — left = field label + req/opt tag,
 *                 right = `<Select>` populated from the spreadsheet headers
 *   [preview]     First 5 rows rendered as a compact card-style table.
 *                 Mapped columns get a soft axis-yellow tint so the user can
 *                 see exactly what each Select will pull.
 *   [actions]     Back (ghost) / Validate & Import (yellow primary)
 */

import { useMemo } from 'react';
import { ArrowLeft, Check, FileSpreadsheet, Loader2 } from 'lucide-react';
import type {
  SpreadsheetImportResult,
  SpreadsheetColumnMapping,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

type OptionalKey =
  | 'quantityColumn'
  | 'manufacturerColumn'
  | 'mountTypeColumn'
  | 'locationColumn';

// =============================================================================
// COMPONENT
// =============================================================================

export function ColumnMapper({
  data,
  mapping,
  onMappingChange,
  onProceed,
  onBack,
  isProcessing = false,
}: ColumnMapperProps) {
  // Build option list once per header change.
  const options = useMemo(
    () =>
      data.headers.map((header, index) => ({
        value: String(index),
        label: header || `Column ${index + 1}`,
      })),
    [data.headers]
  );

  const handleRequiredChange = (next: string) => {
    onMappingChange({
      ...mapping,
      modelColumn: parseInt(next, 10),
    });
  };

  const handleOptionalChange = (key: OptionalKey, next: string) => {
    if (next === 'none') {
      const updated = { ...mapping };
      delete (updated as Partial<SpreadsheetColumnMapping>)[key];
      onMappingChange(updated);
    } else {
      onMappingChange({
        ...mapping,
        [key]: parseInt(next, 10),
      });
    }
  };

  // Set of column indices that are currently mapped — drives the preview tint.
  const mappedColumns = useMemo(() => {
    const set = new Set<number>([mapping.modelColumn]);
    if (mapping.quantityColumn !== undefined) set.add(mapping.quantityColumn);
    if (mapping.manufacturerColumn !== undefined) set.add(mapping.manufacturerColumn);
    if (mapping.mountTypeColumn !== undefined) set.add(mapping.mountTypeColumn);
    if (mapping.locationColumn !== undefined) set.add(mapping.locationColumn);
    return set;
  }, [mapping]);

  const previewRows = data.rows.slice(0, 5);

  return (
    <div data-swift className="flex flex-col gap-6">
      {/* File pill */}
      <div
        className={cn(
          'inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-surface-2 px-3 py-1.5'
        )}
      >
        <FileSpreadsheet className="size-3.5 text-axis-yellow-ink" strokeWidth={1.75} />
        <span className="text-[13px] font-medium text-ink">{data.filename}</span>
        <span className="font-mono text-[11px] tabular-nums text-ink-faint">
          {data.rowCount} rows
        </span>
      </div>

      {/* Mapping section */}
      <section
        className={cn(
          'flex flex-col gap-4 rounded-lg border border-hairline bg-surface p-5 shadow-sm'
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">
            Map columns
          </h3>
          <p className="text-[12px] text-ink-muted">
            Tell AxisX which spreadsheet column holds each field.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldRow label="Model Number" required>
            <Select
              value={String(mapping.modelColumn)}
              onValueChange={handleRequiredChange}
              aria-label="Model Number column"
            >
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </FieldRow>

          <FieldRow label="Quantity">
            <Select
              value={
                mapping.quantityColumn !== undefined
                  ? String(mapping.quantityColumn)
                  : 'none'
              }
              onValueChange={(v) => handleOptionalChange('quantityColumn', v)}
              aria-label="Quantity column"
            >
              <SelectItem value="none">None (default to 1)</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </FieldRow>

          <FieldRow label="Manufacturer">
            <Select
              value={
                mapping.manufacturerColumn !== undefined
                  ? String(mapping.manufacturerColumn)
                  : 'none'
              }
              onValueChange={(v) => handleOptionalChange('manufacturerColumn', v)}
              aria-label="Manufacturer column"
            >
              <SelectItem value="none">None</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </FieldRow>

          <FieldRow label="Mount Type">
            <Select
              value={
                mapping.mountTypeColumn !== undefined
                  ? String(mapping.mountTypeColumn)
                  : 'none'
              }
              onValueChange={(v) => handleOptionalChange('mountTypeColumn', v)}
              aria-label="Mount Type column"
            >
              <SelectItem value="none">None</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </FieldRow>

          <FieldRow label="Location">
            <Select
              value={
                mapping.locationColumn !== undefined
                  ? String(mapping.locationColumn)
                  : 'none'
              }
              onValueChange={(v) => handleOptionalChange('locationColumn', v)}
              aria-label="Location column"
            >
              <SelectItem value="none">None</SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </FieldRow>
        </div>
      </section>

      {/* Preview */}
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">
            Preview
          </h3>
          <p className="text-[12px] text-ink-muted">
            Showing first {previewRows.length} of {data.rowCount} rows
          </p>
        </div>

        <div
          className={cn(
            'overflow-hidden rounded-lg border border-hairline bg-surface shadow-sm'
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="bg-surface-2">
                  <th className="border-b border-hairline px-3 py-2 font-semibold text-ink-muted">
                    #
                  </th>
                  {data.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className={cn(
                        'border-b border-hairline px-3 py-2 font-semibold text-ink',
                        mappedColumns.has(idx) && 'bg-axis-yellow-soft'
                      )}
                    >
                      {header || `Col ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="border-b border-hairline px-3 py-2 text-ink-faint">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn(
                          'border-b border-hairline px-3 py-2 text-ink',
                          mappedColumns.has(colIdx) && 'bg-axis-yellow-soft/60'
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onProceed}
          disabled={isProcessing}
          className="h-9 gap-1.5 bg-axis-yellow text-ink shadow-sm hover:brightness-105 active:brightness-95"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Validating…
            </>
          ) : (
            <>
              <Check className="size-3.5" />
              Validate &amp; Import
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// FIELD ROW
// =============================================================================

interface FieldRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldRow({ label, required = false, children }: FieldRowProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1 text-[12px] font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            *
          </span>
        ) : (
          <span className="font-normal text-ink-faint">(optional)</span>
        )}
      </span>
      {children}
    </label>
  );
}
