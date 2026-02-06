/**
 * Spreadsheet Module
 *
 * Provides parsing and data extraction for CSV and Excel files.
 */

export {
  parseSpreadsheetFile,
  detectFileType,
  isFileSizeValid,
  detectColumnMapping,
  extractData,
  type ParseOptions,
  type ParseError,
  type ParseResult,
  type ExtractedRow,
} from './parser';
