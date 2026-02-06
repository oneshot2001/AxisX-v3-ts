/**
 * useSpreadsheetImport Hook
 *
 * Manages spreadsheet import workflow including file parsing,
 * column mapping, validation, and integration with batch search.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  ISearchEngine,
  SpreadsheetImportResult,
  SpreadsheetColumnMapping,
  SpreadsheetValidationResult,
  SpreadsheetValidationStatus,
} from '@/types';
import {
  parseSpreadsheetFile,
  detectColumnMapping,
  extractData,
} from '@/core/spreadsheet';

// =============================================================================
// TYPES
// =============================================================================

export type ImportStep = 'upload' | 'mapping' | 'validation' | 'complete';

export interface UseSpreadsheetImportOptions {
  /** Callback when import is complete */
  readonly onComplete?: (results: readonly SpreadsheetValidationResult[]) => void;
}

export interface UseSpreadsheetImportReturn {
  /** Current step in the import workflow */
  readonly step: ImportStep;

  /** Parsed spreadsheet data */
  readonly spreadsheetData: SpreadsheetImportResult | null;

  /** Current column mapping */
  readonly columnMapping: SpreadsheetColumnMapping | null;

  /** Validation results */
  readonly validationResults: readonly SpreadsheetValidationResult[];

  /** Is currently processing */
  readonly isProcessing: boolean;

  /** Current progress (for validation) */
  readonly progress: { current: number; total: number; percent: number };

  /** Error message if any */
  readonly error: string | null;

  /** Upload a file */
  readonly uploadFile: (file: File) => Promise<void>;

  /** Update column mapping */
  readonly setColumnMapping: (mapping: SpreadsheetColumnMapping) => void;

  /** Run validation on mapped data */
  readonly runValidation: () => Promise<void>;

  /** Go back to previous step */
  readonly goBack: () => void;

  /** Reset the entire workflow */
  readonly reset: () => void;

  /** Get validated items ready for batch import */
  readonly getValidItems: () => readonly SpreadsheetValidationResult[];

  /** Summary stats */
  readonly summary: {
    readonly totalRows: number;
    readonly validatedRows: number;
    readonly foundCount: number;
    readonly notFoundCount: number;
    readonly duplicateCount: number;
    readonly invalidCount: number;
  };
}

// =============================================================================
// HOOK
// =============================================================================

export function useSpreadsheetImport(
  engine: ISearchEngine,
  options: UseSpreadsheetImportOptions = {}
): UseSpreadsheetImportReturn {
  const { onComplete } = options;

  // State
  const [step, setStep] = useState<ImportStep>('upload');
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetImportResult | null>(null);
  const [columnMapping, setColumnMappingState] = useState<SpreadsheetColumnMapping | null>(null);
  const [validationResults, setValidationResults] = useState<SpreadsheetValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [error, setError] = useState<string | null>(null);

  // Upload file
  const uploadFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    const result = await parseSpreadsheetFile(file);

    if (!result.success) {
      setError(result.error.message);
      setIsProcessing(false);
      return;
    }

    setSpreadsheetData(result.data);

    // Auto-detect column mapping
    const detectedMapping = detectColumnMapping(result.data.headers);
    setColumnMappingState(detectedMapping);

    setStep('mapping');
    setIsProcessing(false);
  }, []);

  // Update column mapping
  const setColumnMapping = useCallback((mapping: SpreadsheetColumnMapping) => {
    setColumnMappingState(mapping);
  }, []);

  // Run validation
  const runValidation = useCallback(async () => {
    if (!spreadsheetData || !columnMapping) return;

    setIsProcessing(true);
    setError(null);
    setStep('validation');

    // Extract data using column mapping
    const extractedRows = extractData(spreadsheetData.rows, columnMapping);
    const total = extractedRows.length;

    setProgress({ current: 0, total, percent: 0 });

    const results: SpreadsheetValidationResult[] = [];
    const seenModels = new Set<string>();

    for (let i = 0; i < extractedRows.length; i++) {
      const row = extractedRows[i];
      if (!row) continue;

      const normalizedModel = row.model.toUpperCase().trim();

      // Check for duplicates
      let status: SpreadsheetValidationStatus;
      let searchResponse;

      if (seenModels.has(normalizedModel)) {
        status = 'duplicate';
      } else if (!row.model || row.model.length < 2) {
        status = 'invalid';
      } else {
        // Perform search
        try {
          searchResponse = engine.search(row.model);
          status = searchResponse.results.length > 0 ? 'found' : 'not-found';
          seenModels.add(normalizedModel);
        } catch {
          status = 'invalid';
        }
      }

      results.push({
        row: row.rowIndex + 1, // 1-based for display
        input: row.model,
        status,
        searchResponse,
        quantity: row.quantity,
      });

      // Update progress
      setProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
      });

      // Small delay to prevent UI blocking
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    setValidationResults(results);
    setIsProcessing(false);
    setStep('complete');

    // Call onComplete callback
    if (onComplete) {
      onComplete(results);
    }
  }, [spreadsheetData, columnMapping, engine, onComplete]);

  // Go back to previous step
  const goBack = useCallback(() => {
    switch (step) {
      case 'mapping':
        setStep('upload');
        setSpreadsheetData(null);
        setColumnMappingState(null);
        break;
      case 'validation':
      case 'complete':
        setStep('mapping');
        setValidationResults([]);
        break;
    }
  }, [step]);

  // Reset everything
  const reset = useCallback(() => {
    setStep('upload');
    setSpreadsheetData(null);
    setColumnMappingState(null);
    setValidationResults([]);
    setIsProcessing(false);
    setProgress({ current: 0, total: 0, percent: 0 });
    setError(null);
  }, []);

  // Get valid items (found items only)
  const getValidItems = useCallback(() => {
    return validationResults.filter((r) => r.status === 'found');
  }, [validationResults]);

  // Summary stats
  const summary = useMemo(() => {
    const foundCount = validationResults.filter((r) => r.status === 'found').length;
    const notFoundCount = validationResults.filter((r) => r.status === 'not-found').length;
    const duplicateCount = validationResults.filter((r) => r.status === 'duplicate').length;
    const invalidCount = validationResults.filter((r) => r.status === 'invalid').length;

    return {
      totalRows: spreadsheetData?.rowCount ?? 0,
      validatedRows: validationResults.length,
      foundCount,
      notFoundCount,
      duplicateCount,
      invalidCount,
    };
  }, [validationResults, spreadsheetData]);

  return {
    step,
    spreadsheetData,
    columnMapping,
    validationResults,
    isProcessing,
    progress,
    error,
    uploadFile,
    setColumnMapping,
    runValidation,
    goBack,
    reset,
    getValidItems,
    summary,
  };
}
