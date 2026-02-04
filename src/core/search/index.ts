/**
 * Search Module
 * 
 * Export all search functionality from a single location.
 */

// Core engine
export { SearchEngine, createSearchEngine } from './engine';

// Fuzzy matching algorithms
export {
  levenshteinDistance,
  similarity,
  scoreMatch,
  sortByScore,
  normalizeStrict,
  normalizeDisplay,
  normalizeVoice,
  THRESHOLDS,
  type MatchScore,
} from './fuzzy';

// Query parsing
export {
  parseQuery,
  parseBatchInput,
  validateQuery,
  validateBatch,
  MIN_QUERY_LENGTH,
  MAX_QUERY_LENGTH,
  MAX_BATCH_SIZE,
  type ParsedQuery,
} from './queryParser';
