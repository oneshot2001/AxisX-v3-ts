/**
 * AxisX v3 Type Definitions
 * 
 * The type system is the foundation of everything.
 * These types enforce correctness across the entire application.
 * 
 * Organization:
 * 1. Manufacturers & Categories
 * 2. Axis Models & Features  
 * 3. Data Mappings
 * 4. Search System
 * 5. URL Resolution
 * 6. Cart & BOM
 * 7. MSRP & Pricing
 * 8. Voice Input
 * 9. Mount Compatibility
 * 10. UI State
 * 11. Theme
 * 12. Utilities
 * 13. PDF Export
 * 14. Batch Operations
 * 15. Spreadsheet Import
 * 16. Axis Product Specs
 */

// =============================================================================
// 1. MANUFACTURERS & CATEGORIES
// =============================================================================

/** NDAA Section 889 banned manufacturers - CRITICAL for compliance */
export type NDAAbannedManufacturer = 'Hikvision' | 'Dahua' | 'Uniview';

/** Cloud-native vendors with subscription models */
export type CloudManufacturer = 'Verkada' | 'Rhombus';

/** Korean manufacturers (Samsung legacy → Hanwha) */
export type KoreanManufacturer = 'Hanwha Vision' | 'Hanwha' | 'Samsung';

/** Japanese manufacturers */
export type JapaneseManufacturer = 'i-PRO' | 'Panasonic';

/** Motorola Solutions family */
export type MotorolaManufacturer = 'Avigilon' | 'Pelco';

/** All supported competitor manufacturers */
export type CompetitorManufacturer =
  | NDAAbannedManufacturer
  | CloudManufacturer
  | KoreanManufacturer
  | JapaneseManufacturer
  | MotorolaManufacturer
  | 'Vivotek'
  | 'Bosch'
  | 'Sony'
  | 'Canon'
  | 'Arecont Vision'
  | 'March Networks'
  | 'Honeywell'
  | '2N'
  | 'Axis'; // For legacy Axis → current Axis

/** Category identifiers for filtering and display */
export type CategoryId =
  | 'all'
  | 'ndaa'
  | 'cloud'
  | 'korean'
  | 'japanese'
  | 'motorola'
  | 'taiwan'
  | 'competitive'
  | 'family'
  | 'defunct'
  | 'legacy-axis';

/** Category definition with metadata */
export interface Category {
  readonly id: CategoryId;
  readonly label: string;
  readonly shortLabel: string;
  readonly manufacturers: readonly CompetitorManufacturer[];
  readonly color: string;
  readonly icon: string;
  readonly description: string;
}

/** Category registry - immutable */
export type CategoryRegistry = Readonly<Record<CategoryId, Category>>;

// =============================================================================
// 2. AXIS MODELS & FEATURES
// =============================================================================

/** Axis camera series (first letter of model) */
export type AxisSeries = 'P' | 'Q' | 'M' | 'F' | 'T' | 'V' | 'W' | 'D' | 'C' | 'A';

/** Axis form factors derived from model naming */
export type AxisFormFactor =
  | 'box'
  | 'bullet'
  | 'fixed-dome'
  | 'compact-dome'
  | 'ptz'
  | 'panoramic'
  | 'modular'
  | 'thermal'
  | 'encoder'
  | 'door-station'
  | 'intercom'
  | 'speaker'
  | 'body-worn'
  | 'specialty';

/** Axis product features/technologies */
export type AxisFeature =
  | 'Lightfinder 2.0'
  | 'Forensic WDR'
  | 'Zipstream'
  | 'DLPU'
  | 'MLPU'
  | 'ARTPEC-8'
  | 'ARTPEC-9'
  | 'Object Analytics'
  | 'IR'
  | 'PoE'
  | 'PoE+'
  | 'IK10'
  | 'IK08'
  | 'IP66'
  | 'IP67'
  | 'NEMA 4X'
  | 'Two-way Audio'
  | 'Edge Storage'
  | 'Signed Video'
  | 'Radar'
  | 'LPR'
  | 'PTZ Autotracking'
  | 'Audio Analytics'
  | 'Cybersecurity'
  | 'VAPIX'
  | 'ACAP';

/** Camera resolution values */
export type Resolution =
  | 'VGA'
  | '720p'
  | '1080p'
  | '3MP'
  | '4MP'
  | '5MP'
  | '4K'
  | '8MP'
  | '12MP'
  | '4x4MP'
  | '4x5MP'
  | '3x5MP'
  | 'Thermal'
  | 'Multi-sensor';

/** Axis model information */
export interface AxisModelInfo {
  readonly model: string;
  readonly series: AxisSeries;
  readonly formFactor: AxisFormFactor;
  readonly resolution: Resolution;
  readonly features: readonly AxisFeature[];
  readonly msrp: number | null;
  readonly url: string;
  readonly isDiscontinued: boolean;
  readonly replacedBy?: string;
}

// =============================================================================
// 3. DATA MAPPINGS (crossref_data.json)
// =============================================================================

/**
 * Competitor camera → Axis replacement mapping
 * This is the core data structure for competitive displacement
 */
export interface CompetitorMapping {
  /** Competitor model number (e.g., "DS-2CD2143G2-I") */
  readonly competitor_model: string;

  /** Manufacturer name */
  readonly competitor_manufacturer: CompetitorManufacturer | string;

  /** Recommended Axis replacement */
  readonly axis_replacement: string;

  /** Key Axis features for this replacement */
  readonly axis_features?: readonly string[];

  /** Match confidence 0-100 */
  readonly match_confidence: number;

  /** Competitor camera type/description */
  readonly competitor_type?: string;

  /** Competitor resolution */
  readonly competitor_resolution?: string;

  /** Sales notes */
  readonly notes?: string;
}

/**
 * Legacy/discontinued Axis model → current replacement
 * For upgrade path recommendations
 */
export interface LegacyAxisMapping {
  /** Discontinued Axis model */
  readonly legacy_model: string;

  /** Current Axis replacement */
  readonly replacement_model: string;

  /** Migration notes */
  readonly notes?: string;

  /** Year discontinued */
  readonly discontinued_year?: number;
}

/**
 * Complete crossref_data.json structure
 */
export interface CrossRefData {
  readonly mappings: readonly CompetitorMapping[];
  readonly axis_legacy_database: {
    readonly mappings: readonly LegacyAxisMapping[];
  };
  readonly metadata?: {
    readonly version: string;
    readonly last_updated: string;
    readonly total_mappings: number;
  };
}

// =============================================================================
// 4. SEARCH SYSTEM
// =============================================================================

/** Match quality classification */
export type MatchType = 'exact' | 'partial' | 'similar' | 'none';

/** Query type for routing */
export type QueryType =
  | 'competitor'      // Default: competitor model search
  | 'legacy'          // Discontinued Axis model
  | 'axis-model'      // Direct Axis model lookup (P3265, Q6135, etc.)
  | 'axis-browse'     // User typed "axis" - show all series
  | 'axis-type-browse'// Browse Axis portfolio by camera type
  | 'manufacturer';   // User typed manufacturer name

/** Individual search result */
export interface SearchResult {
  /** Fuzzy match score 0-100 */
  readonly score: number;

  /** Match quality classification */
  readonly type: MatchType;

  /** The matched mapping */
  readonly mapping: CompetitorMapping | LegacyAxisMapping;

  /** Is this from the legacy database? */
  readonly isLegacy: boolean;

  /** Axis model URL (resolved) */
  readonly axisUrl: string;

  /** Category for display styling */
  readonly category: CategoryId;
}

/** Grouped search results by quality */
export interface GroupedResults {
  readonly exact: readonly SearchResult[];
  readonly partial: readonly SearchResult[];
  readonly similar: readonly SearchResult[];
}

/** Complete search response */
export interface SearchResponse {
  /** Original query */
  readonly query: string;

  /** Detected query type */
  readonly queryType: QueryType;

  /** All results (flattened, sorted by score) */
  readonly results: readonly SearchResult[];

  /** Grouped by match quality */
  readonly grouped: GroupedResults;

  /** Suggested corrections for typos */
  readonly suggestions: readonly string[];

  /** Overall confidence in results */
  readonly confidence: 'high' | 'medium' | 'low' | 'none';

  /** Search duration in ms */
  readonly durationMs: number;

  /** Was this a batch search? */
  readonly isBatch: boolean;

  /** Error message if search failed */
  readonly error?: string;
}

/** Search engine configuration */
export interface SearchConfig {
  /** Maximum results to return */
  readonly maxResults: number;

  /** Minimum score threshold (0-100) */
  readonly minScore: number;

  /** Enable fuzzy matching */
  readonly fuzzyEnabled: boolean;

  /** Enable suggestions */
  readonly suggestionsEnabled: boolean;

  /** Maximum suggestions */
  readonly maxSuggestions: number;
}

/** Search engine interface */
export interface ISearchEngine {
  /** Main search - handles all query types */
  search(query: string): SearchResponse;

  /** Search competitor database only */
  searchCompetitor(query: string): readonly SearchResult[];

  /** Search legacy Axis database only */
  searchLegacy(query: string): readonly SearchResult[];

  /** Lookup Axis model info */
  lookupAxisModel(model: string): AxisModelInfo | null;

  /** Get all models for a manufacturer */
  getManufacturerModels(manufacturer: string): readonly CompetitorMapping[];

  /** Batch search multiple models */
  searchBatch(queries: readonly string[]): Map<string, SearchResponse>;

  /** Get search suggestions for partial input */
  getSuggestions(partial: string): readonly string[];

  /** Update configuration */
  configure(config: Partial<SearchConfig>): void;
}

// =============================================================================
// 5. URL RESOLUTION
// =============================================================================

/** URL confidence level */
export type URLConfidence = 'verified' | 'generated' | 'alias' | 'search-fallback';

/** Resolved URL result */
export interface ResolvedURL {
  /** Final URL to use */
  readonly url: string;

  /** How we got this URL */
  readonly confidence: URLConfidence;

  /** Is this a discontinued product? */
  readonly isDiscontinued: boolean;

  /** Model that was resolved (may differ from input) */
  readonly resolvedModel: string;

  /** Warning message if any */
  readonly warning?: string;
}

/** Model alias for common typos/variants */
export interface ModelAlias {
  /** Invalid/variant model */
  readonly from: string;

  /** Correct model */
  readonly to: string;

  /** Reason for alias */
  readonly reason?: string;
}

/** URL resolver interface */
export interface IURLResolver {
  /** Resolve model to URL */
  resolve(model: string): ResolvedURL;

  /** Check if model has verified URL */
  isVerified(model: string): boolean;

  /** Check if model is discontinued */
  isDiscontinued(model: string): boolean;

  /** Get all verified URLs (for debugging) */
  getVerifiedUrls(): ReadonlyMap<string, string>;

  /** Add verified URL (runtime) */
  addVerifiedUrl(model: string, url: string): void;
}

// =============================================================================
// 6. CART & BOM
// =============================================================================

/** Cart item */
export interface CartItem {
  /** Unique ID for React keys */
  readonly id: string;

  /** Axis model number */
  readonly model: string;

  /** MSRP price (null = TBD) */
  readonly msrp: number | null;

  /** Quantity */
  quantity: number;

  /** How this was added */
  readonly source: 'search' | 'legacy' | 'direct' | 'batch';

  /** Original competitor model (if from search) */
  readonly competitorModel?: string;

  /** Original manufacturer (if from search) */
  readonly competitorManufacturer?: string;

  /** Resolved Axis.com URL */
  readonly axisUrl: string;

  /** Notes */
  notes?: string;

  /** Key Axis features / "Why Switch" selling points (from competitor mapping) */
  readonly axisFeatures?: readonly string[];
}

/** Cart summary */
export interface CartSummary {
  /** Total unique models */
  readonly uniqueModels: number;

  /** Total quantity (all items) */
  readonly totalQuantity: number;

  /** Total MSRP (known prices only) */
  readonly totalMSRP: number;

  /** Count of items with unknown pricing */
  readonly unknownPriceCount: number;

  /** Formatted total for display */
  readonly formattedTotal: string;
}

/** Batch input result */
export interface BatchParseResult {
  /** Valid, deduplicated items */
  readonly items: readonly string[];

  /** Duplicates removed */
  readonly duplicates: readonly string[];

  /** Invalid entries */
  readonly invalid: readonly string[];

  /** Count stats */
  readonly stats: {
    readonly total: number;
    readonly valid: number;
    readonly duplicate: number;
    readonly invalid: number;
  };
}

// =============================================================================
// 7. MSRP & PRICING
// =============================================================================

/** MSRP lookup result */
export interface MSRPResult {
  /** Price or null if unknown */
  readonly price: number | null;

  /** How price was found */
  readonly matchType: 'direct' | 'base-model' | 'variant' | 'not-found';

  /** Model that matched (may differ from query) */
  readonly matchedModel?: string;

  /** Formatted price string */
  readonly formatted: string;
}

/** MSRP data structure */
export interface MSRPData {
  /** Model → price lookup */
  readonly model_lookup: Readonly<Record<string, number>>;
}

/** MSRP lookup interface */
export interface IMSRPLookup {
  /** Look up price */
  lookup(model: string): MSRPResult;

  /** Get raw price or null */
  getPrice(model: string): number | null;

  /** Format price for display */
  formatPrice(price: number | null): string;

  /** Calculate total for items */
  calculateTotal(items: readonly { model: string; quantity: number }[]): {
    total: number;
    unknownCount: number;
  };

  /** Check if model has known price */
  hasPrice(model: string): boolean;
}

// =============================================================================
// 8. VOICE INPUT
// =============================================================================

/** Voice recognition state */
export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

/** Voice error types */
export type VoiceErrorType =
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unknown';

/** Voice error */
export interface VoiceError {
  readonly type: VoiceErrorType;
  readonly message: string;
  readonly recoverable: boolean;
}

/** Voice input result */
export interface VoiceResult {
  /** Raw transcript */
  readonly raw: string;

  /** Normalized for search */
  readonly normalized: string;

  /** Confidence 0-1 */
  readonly confidence: number;

  /** Is this a final result? */
  readonly isFinal: boolean;
}

/** Voice input interface */
export interface IVoiceInput {
  /** Is voice supported in this browser? */
  readonly isSupported: boolean;

  /** Current state */
  readonly state: VoiceState;

  /** Start listening */
  start(): void;

  /** Stop listening */
  stop(): void;

  /** Abort (cancel without result) */
  abort(): void;

  /** Event handlers */
  onResult: ((result: VoiceResult) => void) | null;
  onError: ((error: VoiceError) => void) | null;
  onStateChange: ((state: VoiceState) => void) | null;
}

// =============================================================================
// 9. MOUNT COMPATIBILITY
// =============================================================================

/** Placement types */
export type PlacementType =
  | 'wall'
  | 'ceiling'
  | 'pole'
  | 'parapet'
  | 'pendant'
  | 'corner'
  | 'flush'
  | 'recessed';

/** Camera form factor for mount compatibility */
export type MountFormFactor =
  | 'dome'
  | 'bullet'
  | 'ptz'
  | 'box'
  | 'panoramic'
  | 'compact';

/** Mount accessory */
export interface MountAccessory {
  /** T-series model */
  readonly model: string;

  /** Description */
  readonly description: string;

  /** MSRP */
  readonly msrp: number;

  /** Required or optional */
  readonly required: boolean;

  /** Installation order */
  readonly order: number;
}

/** Mount recommendations */
export interface MountRecommendation {
  readonly formFactor: MountFormFactor;
  readonly placement: PlacementType;
  readonly accessories: readonly MountAccessory[];
  readonly totalMSRP: number;
}

// =============================================================================
// 10. UI STATE
// =============================================================================

/** Main view states */
export type ViewState = 'search' | 'cart' | 'info';

/** Search mode */
export type SearchMode = 'single' | 'batch';

/** Application state */
export interface AppState {
  /** Current view */
  readonly view: ViewState;

  /** Search mode */
  readonly searchMode: SearchMode;

  /** Current search query */
  readonly query: string;

  /** Search results */
  readonly searchResponse: SearchResponse | null;

  /** Is searching */
  readonly isSearching: boolean;

  /** Cart items */
  readonly cart: readonly CartItem[];

  /** Voice state */
  readonly voiceState: VoiceState;

  /** User preferences */
  readonly preferences: UserPreferences;
}

/** User preferences */
export interface UserPreferences {
  /** Show confidence scores */
  readonly showConfidence: boolean;

  /** Show tech translations */
  readonly showTechTranslations: boolean;

  /** Default export format */
  readonly defaultExportFormat: 'pdf' | 'csv';

  /** Voice enabled */
  readonly voiceEnabled: boolean;

  /** Dark mode */
  readonly darkMode: boolean;
}

// =============================================================================
// 11. THEME
// =============================================================================

/** Axis brand theme */
export interface AxisTheme {
  readonly colors: {
    readonly primary: string;
    readonly secondary: string;
    readonly bgMain: string;
    readonly bgAlt: string;
    readonly bgCard: string;
    readonly textPrimary: string;
    readonly textSecondary: string;
    readonly textMuted: string;
    readonly border: string;
    readonly success: string;
    readonly warning: string;
    readonly error: string;
    readonly ndaa: string;
    readonly cloud: string;
  };
  readonly shadows: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
  };
  readonly borderRadius: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly full: string;
  };
  readonly typography: {
    readonly fontFamily: string;
    readonly fontSizes: {
      readonly xs: string;
      readonly sm: string;
      readonly md: string;
      readonly lg: string;
      readonly xl: string;
      readonly xxl: string;
    };
  };
}

// =============================================================================
// 12. UTILITIES
// =============================================================================

/** Result type for operations that can fail */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/** Make properties optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make properties required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Deep readonly */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** Generate unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// =============================================================================
// 13. PDF EXPORT
// =============================================================================

/** Options for generating a Battle Card PDF */
export interface BattleCardOptions {
  readonly items: readonly CartItem[];
  readonly summary: CartSummary;
  readonly projectName: string;
  readonly customerName: string;
  readonly generatedDate: Date;
}

/** Metadata for PDF export header/footer */
export interface ExportMetadata {
  readonly projectName: string;
  readonly customerName: string;
}

// =============================================================================
// 14. BATCH OPERATIONS
// =============================================================================

/** Single item in a batch search */
export interface BatchSearchItem {
  readonly id: string;
  readonly input: string;
  readonly response: SearchResponse | null;
  readonly selected: boolean;
  readonly quantity: number;
  readonly status: 'pending' | 'searching' | 'complete' | 'error';
  readonly error?: string;
}

/** Batch search state */
export interface BatchSearchState {
  readonly items: readonly BatchSearchItem[];
  readonly processing: boolean;
  readonly progress: { readonly current: number; readonly total: number };
}

/** Batch search progress info */
export interface BatchProgress {
  readonly current: number;
  readonly total: number;
  readonly percent: number;
}

// =============================================================================
// 15. SPREADSHEET IMPORT
// =============================================================================

/** Supported spreadsheet file types */
export type SpreadsheetFileType = 'csv' | 'xlsx' | 'xls';

/** Parsed spreadsheet data */
export interface SpreadsheetImportResult {
  readonly filename: string;
  readonly fileType: SpreadsheetFileType;
  readonly rows: readonly string[][];
  readonly headers: readonly string[];
  readonly rowCount: number;
}

/** Column mapping configuration */
export interface SpreadsheetColumnMapping {
  readonly modelColumn: number;
  readonly quantityColumn?: number;
  readonly manufacturerColumn?: number;
}

/** Validation status for an imported row */
export type SpreadsheetValidationStatus = 'found' | 'not-found' | 'duplicate' | 'invalid';

/** Validation result for a single row */
export interface SpreadsheetValidationResult {
  readonly row: number;
  readonly input: string;
  readonly status: SpreadsheetValidationStatus;
  readonly searchResponse?: SearchResponse;
  readonly quantity: number;
}

// =============================================================================
// 16. AXIS PRODUCT SPECS
// =============================================================================

/** Product type classification */
export type AxisProductType =
  | 'camera'
  | 'audio'
  | 'intercom'
  | 'radar'
  | 'access-control'
  | 'networking'
  | 'recorder'
  | 'mount'
  | 'encoder'
  | 'accessory';

/** Camera subcategory by form factor */
export type CameraSubcategory = 'fixed-dome' | 'fixed-bullet' | 'ptz' | 'panoramic' | 'modular' | 'specialty';

/** Video codec types */
export type VideoCodec = 'H.265' | 'H.264' | 'AV1' | 'MJPEG';

/** ARTPEC chipset generations */
export type ARTPECGeneration = 'ARTPEC-7' | 'ARTPEC-8' | 'ARTPEC-9';

/** Chipset and DLPU information */
export interface ChipsetInfo {
  readonly chipset: string | null;
  readonly hasDLPU: boolean;
  readonly generation: ARTPECGeneration | null;
}

/** Network speed classification */
export type NetworkSpeed = '10/100' | '10/100/1000';

/** Recorder-specific specifications */
export interface RecorderSpec {
  readonly storageCapacity?: string;
  readonly cameraLicenses?: number;
  readonly raidSupport?: boolean;
  readonly formFactor?: string;
}

/** Networking switch specifications */
export interface NetworkingSpec {
  readonly portCount?: number;
  readonly poeBudgetWatts?: number;
  readonly managed?: boolean;
  readonly formFactor?: string;
}

/** Mount/bracket specifications */
export interface MountSpec {
  readonly compatibleSeries?: readonly string[];
  readonly material?: string;
  readonly indoorOutdoor?: string;
  readonly loadCapacityKg?: number;
}

/** Encoder specifications */
export interface EncoderSpec {
  readonly channelCount?: number;
  readonly maxResolution?: string;
}

/** Accessory specifications */
export interface AccessorySpec {
  readonly poeClass?: string;
  readonly inputOutput?: string;
  readonly operatingTempRange?: string;
}

/** Infrastructure spec union for non-camera products */
export type InfraSpec =
  | RecorderSpec
  | NetworkingSpec
  | MountSpec
  | EncoderSpec
  | AccessorySpec;

/** Full product specification record */
export interface AxisProductSpec {
  // Identity
  readonly modelKey: string;
  readonly displayName: string;
  readonly family: string;
  readonly seriesId: string;
  readonly productType: AxisProductType;
  readonly cameraType: CameraSubcategory | null;

  // Imaging
  readonly sensor: string | null;
  readonly maxResolution: string | null;
  readonly maxFps: number | null;
  readonly lens: string | null;
  readonly isVarifocal: boolean;

  // Processing
  readonly codecs: readonly VideoCodec[];
  readonly hasZipstream: boolean;
  readonly chipset: ChipsetInfo;
  readonly hasACAP: boolean;

  // Environmental
  readonly ipRating: string | null;
  readonly ikRating: string | null;
  readonly powerType: string | null;
  readonly maxPowerWatts: number | null;

  // Analytics
  readonly analytics: readonly string[];
  readonly hasObjectAnalytics: boolean;
  readonly hasLPR: boolean;
  readonly hasAutotracking: boolean;

  // Connectivity
  readonly networkSpeed: NetworkSpeed | null;
  readonly edgeStorage: string | null;

  // Links
  readonly productUrl: string;
  readonly datasheetUrl: string | null;

  // Infrastructure-specific specs (non-camera products)
  readonly infraSpec?: InfraSpec;
}

/** Spec database JSON structure */
export interface AxisSpecDatabase {
  readonly version: string;
  readonly generatedAt: string;
  readonly totalProducts: number;
  readonly products: Record<string, AxisProductSpec>;
}

/** Spec lookup interface */
export interface ISpecLookup {
  lookupSpec(model: string): AxisProductSpec | null;
  hasSpec(model: string): boolean;
  getByType(type: AxisProductType): AxisProductSpec[];
  getByCameraType(subcat: CameraSubcategory): AxisProductSpec[];
  readonly size: number;
}
