/**
 * AxisX v3 - Main Application
 *
 * Camera cross-reference tool for Axis Communications sales professionals.
 * Migrated to Fluent UI with Axis branding.
 */

import { useEffect, useState } from 'react';
import {
  Button,
  Text,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Search24Regular,
  ClipboardBulletListLtrRegular,
  Info24Regular,
  DocumentBulletList24Regular,
  ArrowUpload24Regular,
  Dismiss24Regular,
  DocumentPdf24Regular,
} from '@fluentui/react-icons';
import type { ISearchEngine, SearchResponse, SearchResult, CartItem, BatchSearchItem } from '@/types';

// Core modules
import { createSearchEngine } from '@/core/search';
import { URLResolver } from '@/core/url';
import { initMSRP } from '@/core/msrp';
import { initSpecs, lookupSpec, getSpecs, hasSpec } from '@/core/specs';

// Hooks
import { useSearch } from '@/hooks/useSearch';
import { useVoice } from '@/hooks/useVoice';
import { useCart } from '@/hooks/useCart';
import { useBatchSearch } from '@/hooks/useBatchSearch';
import { useSpreadsheetImport } from '@/hooks/useSpreadsheetImport';
import { useExportPDF } from '@/hooks/useExportPDF';

// Components
import {
  SearchInput,
  SearchResults,
  CartItemRow,
  BatchInput,
  BatchResults,
  FileUploader,
  ColumnMapper,
  ValidationPreview,
  ImportSummary,
  ExportDialog,
} from '@/components';

// Theme
import { axisTokens } from '@/styles/fluentTheme';

// Data (will be imported at build time)
import crossrefData from '@/data/crossref_data.json';
import msrpData from '@/data/axis_msrp_data.json';
import specData from '@/data/axis_spec_data.json';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  app: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    fontFamily: tokens.fontFamilyBase,
    color: tokens.colorNeutralForeground1,
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: axisTokens.primary,
    margin: 0,
  },
  version: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginLeft: '0.5rem',
    fontWeight: tokens.fontWeightRegular,
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
  },
  main: {
    padding: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  footer: {
    padding: '1rem',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  footerBrand: {
    color: axisTokens.primary,
    fontWeight: tokens.fontWeightSemibold,
  },
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    color: axisTokens.primary,
    fontSize: tokens.fontSizeBase500,
  },
  searchContainer: {
    marginBottom: '1.5rem',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '3rem',
    color: tokens.colorNeutralForeground3,
  },
  emptyCartIcon: {
    fontSize: tokens.fontSizeBase600,
    marginBottom: '0.5rem',
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  cartList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cartSummary: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'right',
  },
  cartTotal: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  cartTbd: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  infoSection: {
    maxWidth: '600px',
  },
  infoHeading: {
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  infoList: {
    lineHeight: 1.8,
  },
});

// =============================================================================
// APP COMPONENT
// =============================================================================

export default function App() {
  const [engine, setEngine] = useState<ISearchEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount
  useEffect(() => {
    // Initialize MSRP lookup
    const msrpLookup = (msrpData as any).model_lookup ?? {};
    initMSRP(msrpLookup);

    // Initialize spec database
    initSpecs(specData as any);

    // Expose spec API on window for console debugging
    (window as any).lookupSpec = lookupSpec;
    (window as any).getSpecs = getSpecs;
    (window as any).hasSpec = hasSpec;

    // Create URL resolver
    const urlResolver = new URLResolver();

    // Create search engine
    const searchEngine = createSearchEngine(
      (crossrefData as any).mappings ?? [],
      (crossrefData as any).axis_legacy_database?.mappings ?? [],
      (model: string) => urlResolver.resolve(model).url
    );

    setEngine(searchEngine);
    setIsInitialized(true);
  }, []);

  if (!isInitialized || !engine) {
    return <LoadingScreen />;
  }

  return <AxisXApp engine={engine} />;
}

// =============================================================================
// LOADING SCREEN
// =============================================================================

function LoadingScreen() {
  const styles = useStyles();

  return (
    <div className={styles.loadingScreen}>
      <Spinner size="large" style={{ color: axisTokens.primary }} />
      <Text className={styles.loadingText}>Loading AxisX...</Text>
    </div>
  );
}

// =============================================================================
// MAIN APP (after initialization)
// =============================================================================

interface AxisXAppProps {
  engine: ISearchEngine;
}

function AxisXApp({ engine }: AxisXAppProps) {
  const styles = useStyles();

  // Search hook
  const {
    query,
    setQuery,
    results,
    isSearching,
    search,
    clear,
  } = useSearch(engine, { debounceMs: 150 });

  // Voice hook
  const {
    isSupported: voiceSupported,
    isListening,
    toggle: toggleVoice,
  } = useVoice({
    onResult: (text) => setQuery(text),
  });

  // Cart hook
  const {
    items: cartItems,
    summary: cartSummary,
    addItem,
    addFromResult,
    removeItem,
    updateQuantity,
    clear: clearCart,
  } = useCart();

  // Handler for adding Axis models directly from browse view
  const handleAddAxisModel = (model: string, quantity: number) => {
    addItem(model, { quantity, source: 'direct' });
  };

  // PDF export hook
  const exportPDF = useExportPDF({
    items: cartItems,
    summary: cartSummary,
  });

  // Batch search hook
  const batchSearch = useBatchSearch(engine, {
    onComplete: (items) => {
      console.log(`Batch search complete: ${items.length} items processed`);
    },
  });

  // View state
  const [view, setView] = useState<'search' | 'batch' | 'cart' | 'info'>('search');

  // Handler to add batch items to cart
  const handleAddBatchToCart = () => {
    const selectedItems = batchSearch.items.filter(
      (item) =>
        item.selected &&
        item.status === 'complete' &&
        item.response &&
        item.response.results.length > 0
    );

    selectedItems.forEach((item) => {
      const response = item.response;
      if (response && response.results.length > 0) {
        const bestResult = response.results[0];
        if (bestResult) {
          addFromResult(bestResult, item.quantity);
        }
      }
    });

    // Clear selection after adding
    batchSearch.deselectAll();
  };

  // Spreadsheet import hook
  const spreadsheetImport = useSpreadsheetImport(engine);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Handler to add validated spreadsheet items to batch
  const handleAddSpreadsheetToBatch = () => {
    const validItems = spreadsheetImport.getValidItems();

    // Build raw input from valid items
    const modelLines = validItems.map((item) => item.input).join('\n');

    // Set the raw input (this will parse and create batch items)
    batchSearch.setRawInput(modelLines);

    // Close modal and reset spreadsheet import
    setIsImportModalOpen(false);
    spreadsheetImport.reset();
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>
          AxisX
          <span className={styles.version}>v3.0</span>
        </h1>

        {/* Nav */}
        <nav className={styles.nav}>
          <Button
            appearance={view === 'search' ? 'primary' : 'subtle'}
            onClick={() => setView('search')}
            icon={<Search24Regular />}
          >
            Search
          </Button>
          <Button
            appearance={view === 'batch' ? 'primary' : 'subtle'}
            onClick={() => setView('batch')}
            icon={<DocumentBulletList24Regular />}
          >
            Batch
          </Button>
          <Button
            appearance={view === 'cart' ? 'primary' : 'subtle'}
            onClick={() => setView('cart')}
            icon={<ClipboardBulletListLtrRegular />}
          >
            BOM ({cartItems.length})
          </Button>
          <Button
            appearance={view === 'info' ? 'primary' : 'subtle'}
            onClick={() => setView('info')}
            icon={<Info24Regular />}
          >
            Info
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {view === 'search' && (
          <SearchView
            query={query}
            setQuery={setQuery}
            results={results}
            isSearching={isSearching}
            search={search}
            clear={clear}
            voiceSupported={voiceSupported}
            isListening={isListening}
            toggleVoice={toggleVoice}
            onAddToCart={addFromResult}
            onAddAxisModel={handleAddAxisModel}
          />
        )}

        {view === 'batch' && (
          <BatchView
            rawInput={batchSearch.rawInput}
            setRawInput={batchSearch.setRawInput}
            modelCount={batchSearch.modelCount}
            items={batchSearch.items}
            isProcessing={batchSearch.isProcessing}
            progress={batchSearch.progress}
            selectedCount={batchSearch.selectedCount}
            onSearch={batchSearch.processBatch}
            onClear={batchSearch.clear}
            onToggleSelection={batchSearch.toggleSelection}
            onSelectAll={batchSearch.selectAll}
            onDeselectAll={batchSearch.deselectAll}
            onQuantityChange={batchSearch.updateQuantity}
            onAddSelectedToCart={handleAddBatchToCart}
            onImport={() => setIsImportModalOpen(true)}
          />
        )}

        {view === 'cart' && (
          <CartView
            items={cartItems}
            summary={cartSummary}
            onRemove={removeItem}
            onQuantityChange={updateQuantity}
            onClear={clearCart}
            onExportPDF={exportPDF.openDialog}
          />
        )}

        {view === 'info' && <InfoView />}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>AxisX</span>
        {' '}{'\u2014'} Built with TypeScript for Axis partners
      </footer>

      {/* Export PDF Dialog */}
      <ExportDialog
        open={exportPDF.isDialogOpen}
        onClose={exportPDF.closeDialog}
        onGenerate={exportPDF.generatePDF}
        isGenerating={exportPDF.isGenerating}
      />

      {/* Import Modal */}
      <Dialog
        open={isImportModalOpen}
        onOpenChange={(_e, data) => {
          if (!data.open) {
            setIsImportModalOpen(false);
            spreadsheetImport.reset();
          }
        }}
      >
        <DialogSurface style={{ maxWidth: '800px', width: '90vw' }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => {
                    setIsImportModalOpen(false);
                    spreadsheetImport.reset();
                  }}
                />
              }
            >
              Import from Spreadsheet
            </DialogTitle>
            <DialogContent>
              {spreadsheetImport.step === 'upload' && (
                <FileUploader
                  onFileSelect={spreadsheetImport.uploadFile}
                  isLoading={spreadsheetImport.isProcessing}
                  error={spreadsheetImport.error}
                />
              )}

              {spreadsheetImport.step === 'mapping' && spreadsheetImport.spreadsheetData && spreadsheetImport.columnMapping && (
                <ColumnMapper
                  data={spreadsheetImport.spreadsheetData}
                  mapping={spreadsheetImport.columnMapping}
                  onMappingChange={spreadsheetImport.setColumnMapping}
                  onProceed={spreadsheetImport.runValidation}
                  onBack={spreadsheetImport.goBack}
                  isProcessing={spreadsheetImport.isProcessing}
                />
              )}

              {(spreadsheetImport.step === 'validation' || spreadsheetImport.step === 'complete') && (
                <>
                  <ValidationPreview
                    results={spreadsheetImport.validationResults}
                    isProcessing={spreadsheetImport.isProcessing}
                    progress={spreadsheetImport.progress}
                  />

                  {spreadsheetImport.step === 'complete' && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <ImportSummary
                        summary={spreadsheetImport.summary}
                        onAddToBatch={handleAddSpreadsheetToBatch}
                        onBack={spreadsheetImport.goBack}
                        onReset={spreadsheetImport.reset}
                      />
                    </div>
                  )}
                </>
              )}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

// =============================================================================
// SEARCH VIEW
// =============================================================================

interface SearchViewProps {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResponse | null;
  isSearching: boolean;
  search: () => void;
  clear: () => void;
  voiceSupported: boolean;
  isListening: boolean;
  toggleVoice: () => void;
  onAddToCart: (result: SearchResult, quantity?: number) => void;
  onAddAxisModel?: (model: string, quantity: number) => void;
}

function SearchView({
  query,
  setQuery,
  results,
  isSearching,
  search,
  clear,
  voiceSupported,
  isListening,
  toggleVoice,
  onAddToCart,
  onAddAxisModel,
}: SearchViewProps) {
  const styles = useStyles();

  return (
    <div>
      {/* Search Input */}
      <div className={styles.searchContainer}>
        <SearchInput
          value={query}
          onChange={setQuery}
          onSearch={search}
          onClear={clear}
          isLoading={isSearching}
          voice={{
            enabled: voiceSupported,
            isListening,
            onToggle: toggleVoice,
          }}
          autoFocus
        />
      </div>

      {/* Results */}
      {results && query && (
        <SearchResults
          response={results}
          onAddToCart={onAddToCart}
          onSuggestionClick={setQuery}
          onAddAxisModel={onAddAxisModel}
        />
      )}
    </div>
  );
}

// =============================================================================
// BATCH VIEW
// =============================================================================

interface BatchViewProps {
  rawInput: string;
  setRawInput: (input: string) => void;
  modelCount: number;
  items: readonly BatchSearchItem[];
  isProcessing: boolean;
  progress: { current: number; total: number; percent: number };
  selectedCount: number;
  onSearch: () => void;
  onClear: () => void;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onAddSelectedToCart: () => void;
  onImport: () => void;
}

function BatchView({
  rawInput,
  setRawInput,
  modelCount,
  items,
  isProcessing,
  progress,
  selectedCount,
  onSearch,
  onClear,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onQuantityChange,
  onAddSelectedToCart,
  onImport,
}: BatchViewProps) {
  return (
    <div>
      {/* Import Button */}
      <div style={{ marginBottom: '1rem' }}>
        <Button
          appearance="outline"
          icon={<ArrowUpload24Regular />}
          onClick={onImport}
        >
          Import from Spreadsheet
        </Button>
      </div>

      {/* Batch Input */}
      <BatchInput
        value={rawInput}
        onChange={setRawInput}
        onSearch={onSearch}
        onClear={onClear}
        modelCount={modelCount}
        isProcessing={isProcessing}
        progress={progress}
      />

      {/* Batch Results */}
      {items.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <BatchResults
            items={items}
            onToggleSelection={onToggleSelection}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
            onQuantityChange={onQuantityChange}
            onAddSelectedToCart={onAddSelectedToCart}
            selectedCount={selectedCount}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CART VIEW
// =============================================================================

interface CartViewProps {
  items: CartItem[];
  summary: any;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onClear: () => void;
  onExportPDF: () => void;
}

function CartView({ items, summary, onRemove, onQuantityChange, onClear, onExportPDF }: CartViewProps) {
  const styles = useStyles();

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <Text className={styles.emptyCartIcon} block>
          <ClipboardBulletListLtrRegular style={{ width: 48, height: 48 }} />
        </Text>
        <Text block>Your BOM is empty</Text>
        <Text size={200} block>
          Search for cameras and add them to build a quote
        </Text>
      </div>
    );
  }

  // Format summary line
  const summaryLine = summary.totalQuantity === items.length
    ? `${items.length} model${items.length === 1 ? '' : 's'}`
    : `${summary.totalQuantity} units across ${items.length} model${items.length === 1 ? '' : 's'}`;

  return (
    <div>
      <div className={styles.cartHeader}>
        <Text size={500} weight="semibold">
          BOM ({summaryLine})
        </Text>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            onClick={onExportPDF}
            appearance="primary"
            icon={<DocumentPdf24Regular />}
            style={{ backgroundColor: axisTokens.primary, color: '#000' }}
          >
            Export PDF
          </Button>
          <Button
            onClick={onClear}
            appearance="primary"
            style={{ backgroundColor: axisTokens.error }}
          >
            Clear BOM
          </Button>
        </div>
      </div>

      <div className={styles.cartList}>
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>

      <div className={styles.cartSummary}>
        <Text className={styles.cartTotal} block>
          Total: {summary.formattedTotal}
        </Text>
        {summary.unknownPriceCount > 0 && (
          <Text className={styles.cartTbd} block>
            + {summary.unknownPriceCount} items with TBD pricing
          </Text>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// INFO VIEW
// =============================================================================

function InfoView() {
  const styles = useStyles();

  return (
    <div className={styles.infoSection}>
      <Text as="h2" size={600} weight="semibold">
        About AxisX v3
      </Text>
      <Text block>
        AxisX is the industry's most comprehensive camera cross-reference tool,
        helping security professionals find the perfect Axis replacement for any
        competitor camera.
      </Text>

      <Text as="h3" size={500} weight="semibold" className={styles.infoHeading}>
        New in v3
      </Text>
      <ul className={styles.infoList}>
        <li><strong>TypeScript</strong> - 100% typed for reliability</li>
        <li><strong>Fluent UI</strong> - Modern Axis-branded interface</li>
        <li><strong>Voice Search</strong> - Hands-free model lookup</li>
        <li><strong>Verified URLs</strong> - No more broken Axis.com links</li>
        <li><strong>Improved Search</strong> - Smarter fuzzy matching</li>
        <li><strong>Faster</strong> - Indexed lookups, instant results</li>
      </ul>

      <Text as="h3" size={500} weight="semibold" className={styles.infoHeading}>
        Manufacturers Covered
      </Text>
      <Text block>
        Hikvision, Dahua, Uniview, Verkada, Rhombus, Hanwha Vision,
        i-PRO, Avigilon, Pelco, Vivotek, Bosch, Sony, and more.
      </Text>
    </div>
  );
}
