# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AxisX v3 is a camera cross-reference tool for Axis Communications sales professionals. It helps find Axis camera replacements for competitor models, with features for NDAA compliance tracking, voice input, and BOM generation. Built with TypeScript strict mode for 100% type safety.

## Development Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Dev server (port 5173)
npm test                     # Run all tests
npm test -- path/to/file     # Single test file
npm test -- --watch          # Watch mode
npm run test:ui              # Visual test UI
npm run test:coverage        # Coverage report
npm run typecheck            # TypeScript validation only
npm run lint                 # ESLint
npm run build                # Production build
npm run deploy               # Build + deploy to Vercel
```

## Deployment

The `npm run deploy` command runs type checking, builds for production, and deploys to Vercel. Ensure you have Vercel CLI configured (`npx vercel login`) before first deploy.

## Architecture

### Three-Layer Separation

```
src/core/       → Pure TypeScript business logic (NO React imports)
src/hooks/      → React hooks wrapping core logic
src/components/ → React UI components consuming hooks
```

This separation is intentional: core algorithms are testable without React and can be reused outside the React context.

### Type System

All types live in `src/types/index.ts` (764 lines, 12 sections). This is the single source of truth. Key interfaces:

- `ISearchEngine` - Search contract with query routing
- `IURLResolver` - URL resolution cascade contract
- `IMSRPLookup` - Price lookup contract
- `SearchResponse` - Complete search result with grouping & confidence
- `CompetitorMapping` / `LegacyAxisMapping` - Data structures

Import types with: `import type { SearchResult } from '@/types';`

### Path Aliases

```typescript
@/         → src/
@/types    → src/types/index.ts
@/core/*   → src/core/*
@/hooks/*  → src/hooks/*
@/components/* → src/components/*
@/data/*   → src/data/*
```

### Search System

Query flow through `src/core/search/`:

1. `queryParser.ts` detects type: competitor | legacy | axis-model | axis-browse | manufacturer
2. `engine.ts` routes to appropriate handler and builds multi-level indexes
3. `fuzzy.ts` performs Levenshtein matching with configurable thresholds:
   - **EXACT** = 90+ (near-perfect match)
   - **PARTIAL** = 70-89 (good match with minor differences)
   - **SIMILAR** = 50-69 (fuzzy match, may need verification)
4. Results grouped by quality tier: exact → partial → similar

### URL Resolution Cascade

`src/core/url/resolver.ts` implements 5-step fallback for URL resolution:

1. **Aliases** - Typo/variant corrections redirect to canonical model
2. **Verified** - Hardcoded known-good URLs (exact match)
3. **Base model** - Strip variant suffixes (-60HZ, -EUR, -24V, lens sizes) and check verified
4. **Discontinued check** - Search fallback for discontinued models
5. **Generated** - Construct URL from pattern `axis.com/products/axis-{model}`

Confidence levels: `'verified' | 'alias' | 'generated' | 'search-fallback'`

### NDAA Categories

Competitor manufacturers are categorized for Section 889 compliance filtering:
- **NDAA banned**: Hikvision, Dahua, Uniview
- **Cloud**: Verkada, Rhombus (subscription-based)
- **Korean**: Hanwha Vision
- **Japanese**: i-PRO, Panasonic
- **Motorola**: Avigilon, Pelco

## Key Patterns

### Adding Core Logic

New business logic goes in `src/core/` as pure functions with no React:

```typescript
// src/core/newfeature/processor.ts
export function processData(input: InputType): OutputType {
  // Pure function, fully testable
}
```

Then wrap in a hook at `src/hooks/useNewFeature.ts` for React consumption.

### Hook Usage

**useSearch** - Debounced search with 150ms delay:
```typescript
const { results, isSearching, query, setQuery } = useSearch();
// setQuery triggers debounced search automatically
```

**useCart** - BOM (Bill of Materials) management:
```typescript
const { items, addItem, removeItem, updateQuantity, clearCart, totalMSRP } = useCart();
// items persist to localStorage
```

**useVoice** - Voice input via Web Speech API:
```typescript
const { isListening, startListening, stopListening, transcript } = useVoice();
```

### Data Files

Static JSON in `src/data/` is bundled at build time:
- `crossref_data.json` - Competitor→Axis mappings
- `axis_msrp_data.json` - Price lookup table

#### Updating Product Data

When updating with new Axis product guides:

1. **Expected JSON structure** for `crossref_data.json`:
```json
{
  "mappings": [
    {
      "competitor": "COMPETITOR-MODEL",
      "manufacturer": "Manufacturer Name",
      "axis_replacements": ["AXIS-MODEL-1", "AXIS-MODEL-2"],
      "notes": "Optional migration notes"
    }
  ]
}
```

2. **Expected JSON structure** for `axis_msrp_data.json`:
```json
{
  "AXIS-MODEL-1": { "msrp": 1299.00, "description": "Product description" },
  "AXIS-MODEL-2": { "msrp": 2499.00, "description": "Product description" }
}
```

3. **Verify after update**:
   - Run `npm run typecheck` to catch any schema mismatches
   - Run `npm test` to ensure search indexing works correctly
   - Test search for new models in dev mode

### Testing

Tests in `tests/` using Vitest with `@testing-library/jest-dom` matchers. Setup in `tests/setup.ts`. Current test files:
- `search.test.ts` - Fuzzy matching, query parsing, search engine
- `url.test.ts` - URL resolution cascade

## Roadmap

See `.agent-os/product/roadmap.md` for current development phases and priorities.
