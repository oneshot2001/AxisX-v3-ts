/**
 * AxisX v3 - Main Application
 * 
 * This is the scaffold. Port your UI components here.
 */

import React, { useEffect, useState } from 'react';
import type { ISearchEngine, SearchResponse, CartItem } from '@/types';

// Core modules
import { createSearchEngine } from '@/core/search';
import { getAxisURL, URLResolver } from '@/core/url';
import { initMSRP, getFormattedPrice } from '@/core/msrp';

// Hooks
import { useSearch } from '@/hooks/useSearch';
import { useVoice } from '@/hooks/useVoice';
import { useCart } from '@/hooks/useCart';

// Theme
import { theme } from './theme';

// Data (will be imported at build time)
import crossrefData from '@/data/crossref_data.json';
import msrpData from '@/data/axis_msrp_data.json';

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
    addFromResult,
    removeItem,
    clear: clearCart,
  } = useCart();

  // View state
  const [view, setView] = useState<'search' | 'cart' | 'info'>('search');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.bgMain,
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.textPrimary,
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontSize: theme.typography.fontSizes.xxl,
          fontWeight: 700,
          color: theme.colors.primary,
          margin: 0,
        }}>
          AxisX
          <span style={{
            fontSize: theme.typography.fontSizes.sm,
            color: theme.colors.textMuted,
            marginLeft: '0.5rem',
            fontWeight: 400,
          }}>
            v3.0
          </span>
        </h1>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <NavButton 
            active={view === 'search'} 
            onClick={() => setView('search')}
          >
            🔍 Search
          </NavButton>
          <NavButton 
            active={view === 'cart'} 
            onClick={() => setView('cart')}
          >
            🛒 Cart ({cartItems.length})
          </NavButton>
          <NavButton 
            active={view === 'info'} 
            onClick={() => setView('info')}
          >
            ℹ️ Info
          </NavButton>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {view === 'search' && (
          <SearchView
            query={query}
            setQuery={setQuery}
            results={results}
            isSearching={isSearching}
            clear={clear}
            voiceSupported={voiceSupported}
            isListening={isListening}
            toggleVoice={toggleVoice}
            onAddToCart={addFromResult}
          />
        )}

        {view === 'cart' && (
          <CartView
            items={cartItems}
            summary={cartSummary}
            onRemove={removeItem}
            onClear={clearCart}
          />
        )}

        {view === 'info' && <InfoView />}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1rem',
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.typography.fontSizes.sm,
        borderTop: `1px solid ${theme.colors.border}`,
      }}>
        <span style={{ color: theme.colors.primary, fontWeight: 600 }}>AxisX</span>
        {' '}— Built with TypeScript for Axis partners
      </footer>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS (Stubs - port your UI here)
// =============================================================================

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#FFCC33',
      fontSize: '1.5rem',
    }}>
      Loading AxisX...
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: theme.borderRadius.md,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
        backgroundColor: active ? theme.colors.primary : 'transparent',
        color: active ? '#000' : theme.colors.textSecondary,
      }}
    >
      {children}
    </button>
  );
}

interface SearchViewProps {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResponse | null;
  isSearching: boolean;
  clear: () => void;
  voiceSupported: boolean;
  isListening: boolean;
  toggleVoice: () => void;
  onAddToCart: (result: any) => void;
}

function SearchView({
  query,
  setQuery,
  results,
  isSearching,
  voiceSupported,
  isListening,
  toggleVoice,
  onAddToCart,
}: SearchViewProps) {
  return (
    <div>
      {/* Search Input */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search competitor model, Axis model, or manufacturer..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: theme.borderRadius.md,
            border: `2px solid ${theme.colors.border}`,
            outline: 'none',
          }}
        />
        
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: theme.borderRadius.md,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isListening ? theme.colors.error : theme.colors.bgAlt,
              color: isListening ? '#fff' : theme.colors.textPrimary,
              fontSize: '1.25rem',
            }}
            title={isListening ? 'Stop listening' : 'Voice search'}
          >
            🎤
          </button>
        )}
      </div>

      {/* Results */}
      {isSearching && (
        <p style={{ color: theme.colors.textMuted }}>Searching...</p>
      )}

      {results && results.results.length > 0 && (
        <div>
          <p style={{
            color: theme.colors.textMuted,
            marginBottom: '1rem',
            fontSize: theme.typography.fontSizes.sm,
          }}>
            {results.results.length} results • {results.confidence} confidence • {results.durationMs.toFixed(1)}ms
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.results.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                onAddToCart={() => onAddToCart(result)}
              />
            ))}
          </div>
        </div>
      )}

      {results && results.results.length === 0 && query && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: theme.colors.textMuted,
        }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No matches found</p>
          <p>Try a different model number or manufacturer</p>
          {results.suggestions.length > 0 && (
            <p style={{ marginTop: '1rem' }}>
              Did you mean: {results.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginLeft: '0.5rem',
                  }}
                >
                  {s}
                </button>
              ))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultCardProps {
  result: any;
  onAddToCart: () => void;
}

function ResultCard({ result, onAddToCart }: ResultCardProps) {
  const mapping = result.mapping;
  const isLegacy = result.isLegacy;

  const competitorModel = isLegacy ? mapping.legacy_model : mapping.competitor_model;
  const axisModel = isLegacy ? mapping.replacement_model : mapping.axis_replacement;
  const manufacturer = isLegacy ? 'Axis (Legacy)' : mapping.competitor_manufacturer;

  return (
    <div style={{
      padding: '1rem',
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`,
      borderLeft: `4px solid ${theme.colors.primary}`,
      backgroundColor: theme.colors.bgCard,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem',
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: result.category === 'ndaa' ? theme.colors.ndaa : theme.colors.bgAlt,
            color: result.category === 'ndaa' ? '#fff' : theme.colors.textPrimary,
            fontSize: theme.typography.fontSizes.xs,
            fontWeight: 600,
            marginRight: '0.5rem',
          }}>
            {manufacturer}
          </span>
          <span style={{ fontWeight: 600 }}>{competitorModel}</span>
        </div>
        <span style={{
          fontSize: theme.typography.fontSizes.sm,
          color: result.score >= 90 ? theme.colors.success : theme.colors.warning,
        }}>
          {result.score}% match
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        <span style={{ color: theme.colors.primary, fontWeight: 700 }}>→</span>
        <span style={{
          backgroundColor: theme.colors.primary,
          color: '#000',
          padding: '0.25rem 0.5rem',
          borderRadius: theme.borderRadius.sm,
          fontWeight: 600,
        }}>
          AXIS
        </span>
        <span style={{ fontWeight: 700, color: theme.colors.primary }}>
          {axisModel}
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
      }}>
        <a
          href={result.axisUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.primary}`,
            color: theme.colors.primary,
            textDecoration: 'none',
            fontSize: theme.typography.fontSizes.sm,
            fontWeight: 500,
          }}
        >
          View on Axis.com ↗
        </a>
        <button
          onClick={onAddToCart}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: theme.borderRadius.sm,
            border: 'none',
            backgroundColor: theme.colors.primary,
            color: '#000',
            cursor: 'pointer',
            fontSize: theme.typography.fontSizes.sm,
            fontWeight: 500,
          }}
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
}

interface CartViewProps {
  items: CartItem[];
  summary: any;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function CartView({ items, summary, onRemove, onClear }: CartViewProps) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textMuted }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛒</p>
        <p>Your cart is empty</p>
        <p style={{ fontSize: theme.typography.fontSizes.sm }}>
          Search for cameras and add them to build a quote
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <h2 style={{ margin: 0 }}>Cart ({items.length} items)</h2>
        <button
          onClick={onClear}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.error,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '1rem',
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{item.model}</div>
            {item.competitorModel && (
              <div style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.textMuted }}>
                Replaces: {item.competitorModel}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{getFormattedPrice(item.model)}</span>
            <button
              onClick={() => onRemove(item.id)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: theme.colors.error,
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: theme.colors.bgAlt,
        borderRadius: theme.borderRadius.md,
        textAlign: 'right',
      }}>
        <div style={{ fontSize: theme.typography.fontSizes.lg, fontWeight: 700 }}>
          Total: {summary.formattedTotal}
        </div>
        {summary.unknownPriceCount > 0 && (
          <div style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.textMuted }}>
            + {summary.unknownPriceCount} items with TBD pricing
          </div>
        )}
      </div>
    </div>
  );
}

function InfoView() {
  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>About AxisX v3</h2>
      <p>
        AxisX is the industry's most comprehensive camera cross-reference tool,
        helping security professionals find the perfect Axis replacement for any
        competitor camera.
      </p>

      <h3 style={{ marginTop: '1.5rem' }}>New in v3</h3>
      <ul style={{ lineHeight: 1.8 }}>
        <li>✅ <strong>TypeScript</strong> - 100% typed for reliability</li>
        <li>✅ <strong>Voice Search</strong> - Hands-free model lookup</li>
        <li>✅ <strong>Verified URLs</strong> - No more broken Axis.com links</li>
        <li>✅ <strong>Improved Search</strong> - Smarter fuzzy matching</li>
        <li>✅ <strong>Faster</strong> - Indexed lookups, instant results</li>
      </ul>

      <h3 style={{ marginTop: '1.5rem' }}>Manufacturers Covered</h3>
      <p>
        Hikvision, Dahua, Uniview, Verkada, Rhombus, Hanwha Vision, 
        i-PRO, Avigilon, Pelco, Vivotek, Bosch, Sony, and more.
      </p>
    </div>
  );
}
