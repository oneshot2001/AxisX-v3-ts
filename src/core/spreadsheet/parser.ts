/**
 * Spreadsheet Parser
 *
 * Parses CSV and Excel files to extract camera model data.
 * Supports automatic column detection and manual column mapping.
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type {
  SpreadsheetImportResult,
  SpreadsheetFileType,
  SpreadsheetColumnMapping,
} from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface ParseOptions {
  /** Maximum rows to parse (default: 1000) */
  readonly maxRows?: number;
  /** Whether first row is header (default: true) */
  readonly hasHeader?: boolean;
}

export interface ParseError {
  readonly type: 'invalid-file' | 'parse-error' | 'empty-file' | 'too-large';
  readonly message: string;
}

export type ParseResult =
  | { readonly success: true; readonly data: SpreadsheetImportResult }
  | { readonly success: false; readonly error: ParseError };

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_ROWS = 1000;

/** Keywords that suggest a column contains model numbers */
const MODEL_COLUMN_KEYWORDS = [
  'model',
  'part',
  'sku',
  'product',
  'camera',
  'item',
  'number',
  'code',
  'pn',
  'p/n',
];

/** Keywords that suggest a column contains quantities */
const QUANTITY_COLUMN_KEYWORDS = ['qty', 'quantity', 'count', 'amount', 'units'];

/** Keywords that suggest a column contains manufacturer names */
const MANUFACTURER_COLUMN_KEYWORDS = [
  'manufacturer',
  'brand',
  'vendor',
  'make',
  'mfg',
  'mfr',
];

/** Keywords that suggest a column contains mount type descriptions */
const MOUNT_TYPE_COLUMN_KEYWORDS = ['mount', 'mount type', 'mounting', 'installation'];

/** Keywords that suggest a column contains location/zone info */
const LOCATION_COLUMN_KEYWORDS = ['location', 'zone', 'area', 'building', 'floor', 'site'];

// =============================================================================
// FILE TYPE DETECTION
// =============================================================================

/**
 * Detect file type from filename extension.
 */
export function detectFileType(filename: string): SpreadsheetFileType | null {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'xlsx':
      return 'xlsx';
    case 'xls':
      return 'xls';
    default:
      return null;
  }
}

/**
 * Check if file size is within limits.
 */
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

// =============================================================================
// CSV PARSING
// =============================================================================

/**
 * Parse CSV file content.
 */
function parseCSV(
  content: string,
  filename: string,
  options: ParseOptions
): ParseResult {
  const { maxRows = DEFAULT_MAX_ROWS, hasHeader = true } = options;

  const result = Papa.parse<string[]>(content, {
    skipEmptyLines: true,
    preview: maxRows + (hasHeader ? 1 : 0),
  });

  if (result.errors.length > 0) {
    return {
      success: false,
      error: {
        type: 'parse-error',
        message: `CSV parsing error: ${result.errors[0]?.message ?? 'Unknown error'}`,
      },
    };
  }

  const allRows = result.data;
  if (allRows.length === 0) {
    return {
      success: false,
      error: {
        type: 'empty-file',
        message: 'The file is empty or contains no valid data.',
      },
    };
  }

  const headers = hasHeader ? (allRows[0] ?? []) : [];
  const dataRows = hasHeader ? allRows.slice(1) : allRows;

  return {
    success: true,
    data: {
      filename,
      fileType: 'csv',
      rows: dataRows,
      headers,
      rowCount: dataRows.length,
    },
  };
}

// =============================================================================
// EXCEL PARSING
// =============================================================================

/**
 * Parse Excel file content.
 */
function parseExcel(
  buffer: ArrayBuffer,
  filename: string,
  fileType: 'xlsx' | 'xls',
  options: ParseOptions
): ParseResult {
  const { maxRows = DEFAULT_MAX_ROWS, hasHeader = true } = options;

  try {
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        error: {
          type: 'empty-file',
          message: 'The Excel file contains no sheets.',
        },
      };
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return {
        success: false,
        error: {
          type: 'empty-file',
          message: 'The sheet is empty.',
        },
      };
    }

    // Convert to array of arrays
    const allRows: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (allRows.length === 0) {
      return {
        success: false,
        error: {
          type: 'empty-file',
          message: 'The file is empty or contains no valid data.',
        },
      };
    }

    // Limit rows
    const limitedRows = allRows.slice(0, maxRows + (hasHeader ? 1 : 0));

    const headers = hasHeader ? (limitedRows[0]?.map(String) ?? []) : [];
    const dataRows = hasHeader
      ? limitedRows.slice(1).map((row) => row.map(String))
      : limitedRows.map((row) => row.map(String));

    return {
      success: true,
      data: {
        filename,
        fileType,
        rows: dataRows,
        headers,
        rowCount: dataRows.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        type: 'parse-error',
        message: `Excel parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      },
    };
  }
}

// =============================================================================
// MAIN PARSER
// =============================================================================

/**
 * Parse a spreadsheet file (CSV or Excel).
 */
export async function parseSpreadsheetFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  // Check file size
  if (!isFileSizeValid(file)) {
    return {
      success: false,
      error: {
        type: 'too-large',
        message: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      },
    };
  }

  // Detect file type
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return {
      success: false,
      error: {
        type: 'invalid-file',
        message: 'Unsupported file type. Please use CSV, XLSX, or XLS files.',
      },
    };
  }

  // Parse based on file type
  if (fileType === 'csv') {
    const content = await file.text();
    return parseCSV(content, file.name, options);
  } else {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer, file.name, fileType, options);
  }
}

// =============================================================================
// COLUMN DETECTION
// =============================================================================

/**
 * Score a column header for how likely it is to contain model numbers.
 */
function scoreModelColumn(header: string): number {
  const lower = header.toLowerCase();
  let score = 0;

  for (const keyword of MODEL_COLUMN_KEYWORDS) {
    if (lower.includes(keyword)) {
      score += 10;
    }
  }

  // Bonus if it's just "model" or similar
  if (lower === 'model' || lower === 'part number' || lower === 'sku') {
    score += 20;
  }

  return score;
}

/**
 * Score a column header for how likely it is to contain quantities.
 */
function scoreQuantityColumn(header: string): number {
  const lower = header.toLowerCase();
  let score = 0;

  for (const keyword of QUANTITY_COLUMN_KEYWORDS) {
    if (lower.includes(keyword)) {
      score += 10;
    }
  }

  if (lower === 'qty' || lower === 'quantity') {
    score += 20;
  }

  return score;
}

/**
 * Score a column header for how likely it is to contain manufacturer names.
 */
function scoreManufacturerColumn(header: string): number {
  const lower = header.toLowerCase();
  let score = 0;

  for (const keyword of MANUFACTURER_COLUMN_KEYWORDS) {
    if (lower.includes(keyword)) {
      score += 10;
    }
  }

  if (lower === 'manufacturer' || lower === 'brand') {
    score += 20;
  }

  return score;
}

/**
 * Score a column header for how likely it is to contain mount type descriptions.
 */
function scoreMountTypeColumn(header: string): number {
  const lower = header.toLowerCase();
  let score = 0;

  for (const keyword of MOUNT_TYPE_COLUMN_KEYWORDS) {
    if (lower.includes(keyword)) {
      score += 10;
    }
  }

  if (lower === 'mount type' || lower === 'mount' || lower === 'mounting') {
    score += 20;
  }

  return score;
}

/**
 * Score a column header for how likely it is to contain location/zone info.
 */
function scoreLocationColumn(header: string): number {
  const lower = header.toLowerCase();
  let score = 0;

  for (const keyword of LOCATION_COLUMN_KEYWORDS) {
    if (lower.includes(keyword)) {
      score += 10;
    }
  }

  if (lower === 'location' || lower === 'zone' || lower === 'area') {
    score += 20;
  }

  return score;
}

/**
 * Auto-detect column mapping based on headers.
 */
export function detectColumnMapping(
  headers: readonly string[]
): SpreadsheetColumnMapping {
  let modelColumn = 0;
  let quantityColumn: number | undefined;
  let manufacturerColumn: number | undefined;
  let mountTypeColumn: number | undefined;
  let locationColumn: number | undefined;

  let bestModelScore = -1;
  let bestQuantityScore = 0;
  let bestManufacturerScore = 0;
  let bestMountTypeScore = 0;
  let bestLocationScore = 0;

  headers.forEach((header, index) => {
    const modelScore = scoreModelColumn(header);
    const quantityScore = scoreQuantityColumn(header);
    const manufacturerScore = scoreManufacturerColumn(header);
    const mountTypeScore = scoreMountTypeColumn(header);
    const locationScore = scoreLocationColumn(header);

    if (modelScore > bestModelScore) {
      bestModelScore = modelScore;
      modelColumn = index;
    }

    if (quantityScore > bestQuantityScore) {
      bestQuantityScore = quantityScore;
      quantityColumn = index;
    }

    if (manufacturerScore > bestManufacturerScore) {
      bestManufacturerScore = manufacturerScore;
      manufacturerColumn = index;
    }

    if (mountTypeScore > bestMountTypeScore) {
      bestMountTypeScore = mountTypeScore;
      mountTypeColumn = index;
    }

    if (locationScore > bestLocationScore) {
      bestLocationScore = locationScore;
      locationColumn = index;
    }
  });

  return {
    modelColumn,
    quantityColumn: bestQuantityScore > 0 ? quantityColumn : undefined,
    manufacturerColumn: bestManufacturerScore > 0 ? manufacturerColumn : undefined,
    mountTypeColumn: bestMountTypeScore > 0 ? mountTypeColumn : undefined,
    locationColumn: bestLocationScore > 0 ? locationColumn : undefined,
  };
}

// =============================================================================
// DATA EXTRACTION
// =============================================================================

export interface ExtractedRow {
  readonly model: string;
  readonly quantity: number;
  readonly manufacturer?: string;
  readonly mountType?: string;
  readonly location?: string;
  readonly rowIndex: number;
}

/**
 * Extract data from parsed rows using column mapping.
 */
export function extractData(
  rows: readonly string[][],
  mapping: SpreadsheetColumnMapping
): ExtractedRow[] {
  const extracted: ExtractedRow[] = [];

  rows.forEach((row, index) => {
    const model = (row[mapping.modelColumn] ?? '').trim();

    // Skip empty model cells
    if (!model) {
      return;
    }

    // Parse quantity (default to 1)
    let quantity = 1;
    if (mapping.quantityColumn !== undefined) {
      const qtyValue = row[mapping.quantityColumn];
      if (qtyValue) {
        const parsed = parseInt(qtyValue, 10);
        if (!isNaN(parsed) && parsed > 0) {
          quantity = parsed;
        }
      }
    }

    // Get manufacturer if mapped
    let manufacturer: string | undefined;
    if (mapping.manufacturerColumn !== undefined) {
      manufacturer = (row[mapping.manufacturerColumn] ?? '').trim() || undefined;
    }

    // Get mount type if mapped
    let mountType: string | undefined;
    if (mapping.mountTypeColumn !== undefined) {
      mountType = (row[mapping.mountTypeColumn] ?? '').trim() || undefined;
    }

    // Get location if mapped
    let location: string | undefined;
    if (mapping.locationColumn !== undefined) {
      location = (row[mapping.locationColumn] ?? '').trim() || undefined;
    }

    extracted.push({
      model,
      quantity,
      manufacturer,
      mountType,
      location,
      rowIndex: index,
    });
  });

  return extracted;
}
