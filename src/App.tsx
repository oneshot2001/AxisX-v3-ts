/**
 * AxisX v3 - Main Application
 *
 * Camera cross-reference tool for Axis Communications sales professionals.
 * Migrated to Fluent UI with Axis branding.
 */

import { memo, useCallback, useEffect, useState } from 'react';
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
} from '@fluentui/react-icons';
import type {
  ISearchEngine,
  SearchResponse,
  SearchResult,
  BatchSearchItem,
  CrossRefData,
  MSRPData,
  AxisSpecDatabase,
} from '@/types';

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
  Cart,
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

declare global {
  interface Window {
    lookupSpec?: typeof lookupSpec;
    getSpecs?: typeof getSpecs;
    hasSpec?: typeof hasSpec;
  }
}

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
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase300,
    maxWidth: '560px',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: '1.5rem',
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
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      try {
        // Lazy-load large data files so initial JS payload stays smaller.
        const [crossrefModule, msrpModule, specModule] = await Promise.all([
          import('@/data/crossref_data.json'),
          import('@/data/axis_msrp_data.json'),
          import('@/data/axis_spec_data.json'),
        ]);

        if (isCancelled) return;

        const crossrefData = crossrefModule.default as CrossRefData;
        const msrpData = msrpModule.default as MSRPData;
        const specData = specModule.default as AxisSpecDatabase;

        initMSRP(msrpData.model_lookup ?? {});
        initSpecs(specData);

        // Expose spec API on window for console debugging
        window.lookupSpec = lookupSpec;
        window.getSpecs = getSpecs;
        window.hasSpec = hasSpec;

        const urlResolver = new URLResolver();
        const searchEngine = createSearchEngine(
          [...(crossrefData.mappings ?? [])],
          [...(crossrefData.axis_legacy_database?.mappings ?? [])],
          (model: string) => urlResolver.resolve(model).url
        );

        if (!isCancelled) {
          setEngine(searchEngine);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown initialization error';
        if (!isCancelled) {
          setInitError(`Failed to initialize AxisX data: ${message}`);
        }
      } finally {
        if (!isCancelled) {
          setIsInitialized(true);
        }
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (initError) {
    return <InitializationError message={initError} />;
  }

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

function InitializationError({ message }: { message: string }) {
  const styles = useStyles();

  return (
    <div className={styles.loadingScreen}>
      <Text className={styles.errorText}>{message}</Text>
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
  const handleAddAxisModel = useCallback((model: string, quantity: number) => {
    addItem(model, { quantity, source: 'direct' });
  }, [addItem]);

  // PDF export hook
  const exportPDF = useExportPDF({
    items: cartItems,
    summary: cartSummary,
  });

  // Batch search hook
  const batchSearch = useBatchSearch(engine);

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

    // Preserve validated quantities when populating batch items
    batchSearch.setImportedItems(
      validItems.map((item) => ({
        input: item.input,
        quantity: item.quantity,
      }))
    );

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
          <Cart
            items={cartItems}
            summary={cartSummary}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClear={clearCart}
            onExportPDF={exportPDF.openDialog}
            title="BOM"
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

const SearchView = memo(function SearchView({
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
});

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

const BatchView = memo(function BatchView({
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
});

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
