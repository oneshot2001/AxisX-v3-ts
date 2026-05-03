/**
 * AxisX v3 - Main Application
 *
 * Camera cross-reference tool for Axis Communications sales professionals.
 * Migrated to Fluent UI with Axis branding.
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell, type AppView } from '@/components/AppShell';
import { BomDrawer } from '@/components/BomDrawer';
import { Button as UIButton } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  ISearchEngine,
  SearchResponse,
  SearchResult,
  BatchSearchItem,
  CompetitorMapping,
  CrossRefData,
  MSRPData,
  AxisSpecDatabase,
  AccessoryCompatDatabase,
} from '@/types';

// Core modules
import { createSearchEngine } from '@/core/search';
import { URLResolver } from '@/core/url';
import { initMSRP } from '@/core/msrp';
import { initSpecs, lookupSpec, getSpecs, hasSpec } from '@/core/specs';
import { initAccessoryData } from '@/core/accessory';

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
  BatchInput,
  BatchResults,
  FileUploader,
  ColumnMapper,
  ValidationPreview,
  ImportSummary,
  ExportDialog,
} from '@/components';

declare global {
  interface Window {
    lookupSpec?: typeof lookupSpec;
    getSpecs?: typeof getSpecs;
    hasSpec?: typeof hasSpec;
  }
}

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

        // Load accessory data (non-blocking — feature degrades gracefully if absent)
        import('@/data/accessory_compatibility.json')
          .then((accModule) => {
            if (!isCancelled) {
              initAccessoryData(accModule.default as AccessoryCompatDatabase);
            }
          })
          .catch(() => {
            // Accessory data not available yet — feature will be hidden
          });

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
  return (
    <div
      data-swift
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas font-sans text-ink antialiased"
    >
      <Loader2 className="size-7 animate-spin text-axis-yellow-ink" />
      <span className="text-[15px] text-ink-muted">Loading AxisX…</span>
    </div>
  );
}

function InitializationError({ message }: { message: string }) {
  return (
    <div
      data-swift
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 font-sans antialiased"
    >
      <span className="text-[15px] font-semibold text-ink">Couldn't load AxisX</span>
      <p className="max-w-[560px] text-center text-[13px] text-danger">{message}</p>
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
    addAccessoryItem,
    removeItem,
    updateQuantity,
    clear: clearCart,
  } = useCart();

  // BOM drawer state — opens via the BOM trigger in the header.
  const [bomOpen, setBomOpen] = useState(false);

  // Wrapped add-handlers that fire a toast confirmation alongside the cart mutation.
  const addFromResultWithToast = useCallback(
    (result: SearchResult, quantity?: number) => {
      addFromResult(result, quantity);
      const mapping = result.mapping;
      const axisModel = 'axis_replacement' in mapping
        ? (mapping as CompetitorMapping).axis_replacement
        : mapping.replacement_model;
      const qty = quantity ?? 1;
      toast.success(`${axisModel} added to BOM`, {
        description: qty > 1 ? `Quantity ${qty}` : undefined,
        action: { label: 'Open BOM', onClick: () => setBomOpen(true) },
      });
    },
    [addFromResult]
  );

  const handleAddAxisModel = useCallback(
    (model: string, quantity: number) => {
      addItem(model, { quantity, source: 'direct' });
      toast.success(`${model} added to BOM`, {
        description: quantity > 1 ? `Quantity ${quantity}` : undefined,
        action: { label: 'Open BOM', onClick: () => setBomOpen(true) },
      });
    },
    [addItem]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
    toast('BOM cleared');
  }, [clearCart]);

  // PDF export hook
  const exportPDF = useExportPDF({
    items: cartItems,
    summary: cartSummary,
  });

  // Batch search hook
  const batchSearch = useBatchSearch(engine);

  // View state
  const [view, setView] = useState<AppView>('search');

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

          // Add paired mount if mount pairing resolved
          if (item.mountPairing?.mount) {
            const mapping = bestResult.mapping;
            const axisModel = 'axis_replacement' in mapping
              ? (mapping as CompetitorMapping).axis_replacement
              : mapping.replacement_model;
            addAccessoryItem(
              item.mountPairing.mount,
              axisModel,
              item.quantity,
              item.location
            );
          }
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
        mountType: item.mountType,
        location: item.location,
      }))
    );

    // Close modal and reset spreadsheet import
    setIsImportModalOpen(false);
    spreadsheetImport.reset();
  };

  return (
    <>
      <AppShell
        view={view}
        onViewChange={setView}
        cartCount={cartItems.length}
        cartTotal={cartItems.length > 0 ? cartSummary.formattedTotal : undefined}
        bomOpen={bomOpen}
        onOpenCart={() => setBomOpen(true)}
      >
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
            onAddToCart={addFromResultWithToast}
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

        {view === 'info' && <InfoView />}

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
        onOpenChange={(open) => {
          if (!open) {
            setIsImportModalOpen(false);
            spreadsheetImport.reset();
          }
        }}
      >
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Import from Spreadsheet</DialogTitle>
          </DialogHeader>

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
                <div className="mt-6">
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
      </Dialog>
      </AppShell>

      {/* Persistent BOM drawer — opens via the header BOM trigger. */}
      <BomDrawer
        open={bomOpen}
        onOpenChange={setBomOpen}
        items={cartItems}
        summary={cartSummary}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClear={handleClearCart}
        onExportPDF={exportPDF.openDialog}
      />
    </>
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
  return (
    <div>
      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem' }}>
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
    <div data-swift>
      {/* Import Button */}
      <div className="mb-4">
        <UIButton
          variant="outline"
          size="sm"
          onClick={onImport}
          className="gap-1.5"
        >
          <Upload className="size-3.5" />
          Import from Spreadsheet
        </UIButton>
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
        <div className="mt-6">
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
  return (
    <div data-swift className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">About AxisX</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        AxisX is the industry's most comprehensive camera cross-reference tool —
        helping security professionals find the perfect Axis replacement for any
        competitor camera.
      </p>

      <h3 className="mt-8 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
        Capabilities
      </h3>
      <ul className="mt-3 space-y-2 text-[14px] text-ink">
        {[
          ['Voice search', 'Hands-free model lookup with Web Speech API'],
          ['Batch lookup', 'Paste a list, search them all in one pass'],
          ['Spreadsheet import', 'Upload a CSV or XLSX to seed a BOM'],
          ['BOM export', 'One-click PDF for proposals'],
          ['Accessory pairing', 'Auto-pair mounts and power for 156+ models'],
          ['NDAA awareness', 'Section 889 status surfaced on every result'],
        ].map(([title, body]) => (
          <li key={title} className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-axis-yellow" />
            <div>
              <span className="font-medium text-ink">{title}</span>
              <span className="text-ink-muted"> — {body}</span>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
        Manufacturers Covered
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
        Hikvision, Dahua, Uniview, Verkada, Rhombus, Hanwha Vision, i-PRO,
        Avigilon, Pelco, Vivotek, Bosch, Sony, and more.
      </p>
    </div>
  );
}
