# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AxisX v3 is a camera cross-reference tool for Axis Communications sales professionals. It helps find Axis camera replacements for competitor models, with features for NDAA compliance tracking, voice input, and BOM generation. Built with TypeScript strict mode for 100% type safety.

## Development Commands

```bash
npm run dev              # Vite dev server (port 5173, auto-opens browser)
npm run build            # TypeScript compile + Vite production build
npm run preview          # Preview production build locally
npm run typecheck        # TypeScript validation only
npm run lint             # ESLint (strict, 0 warnings allowed)
npm test                 # Run all tests (Vitest)
npm test -- file.test.ts # Run single test file
npm test -- --watch      # Watch mode
npm run test:ui          # Visual test dashboard
npm run test:coverage    # Coverage report
npm run deploy           # Build + deploy to Vercel
```

## Architecture

### Three-Layer Separation

```
src/core/       → Pure TypeScript business logic (NO React imports allowed)
src/hooks/      → React hooks wrapping core logic
src/components/ → React UI components consuming hooks
```

Core algorithms are testable without React and can be reused outside the React context.

### Type System

All types centralized in `src/types/index.ts` (764 lines, 12 sections). Key interfaces:

- `ISearchEngine` - Search contract with query routing
- `IURLResolver` - URL resolution cascade contract
- `IMSRPLookup` - Price lookup contract
- `SearchResponse` / `SearchResult` - Search result structures
- `CompetitorMapping` / `LegacyAxisMapping` - Data structures

Import types: `import type { SearchResult } from '@/types';`

### Path Aliases

```typescript
@/             → src/
@/types        → src/types/index.ts
@/core/*       → src/core/*
@/hooks/*      → src/hooks/*
@/components/* → src/components/*
@/data/*       → src/data/*
```

### Search System (`src/core/search/`)

Query flow:
1. `queryParser.ts` detects type: competitor | legacy | axis-model | axis-browse | manufacturer
2. `engine.ts` routes to appropriate handler with multi-level indexes
3. `fuzzy.ts` performs Levenshtein matching with thresholds:
   - **EXACT** (90+): near-perfect match
   - **PARTIAL** (70-89): good match with minor differences
   - **SIMILAR** (50-69): fuzzy match, may need verification

### URL Resolution Cascade (`src/core/url/resolver.ts`)

5-step fallback for 100% URL accuracy:
1. **Aliases** - Typo/variant corrections redirect to canonical model
2. **Verified** - Hardcoded known-good URLs (exact match)
3. **Base model** - Strip variant suffixes (-60HZ, -EUR, -24V, lens sizes)
4. **Discontinued check** - Search fallback for discontinued models
5. **Generated** - Construct URL from pattern `axis.com/products/axis-{model}`

Confidence levels: `'verified' | 'alias' | 'generated' | 'search-fallback'`

### NDAA Categories

Competitor manufacturers categorized for Section 889 compliance:
- **NDAA banned**: Hikvision, Dahua, Uniview
- **Cloud**: Verkada, Rhombus (subscription-based)
- **Korean**: Hanwha Vision
- **Japanese**: i-PRO, Panasonic
- **Motorola**: Avigilon, Pelco

## Key Patterns

### Adding New Features

1. Add types to `src/types/index.ts`
2. Implement pure function in `src/core/`
3. Wrap with hook in `src/hooks/`
4. Create component in `src/components/`
5. Write tests in `tests/`

### JSON Data Imports

Data files in `src/data/` require `as any` cast due to TypeScript JSON module limitations:

```typescript
import crossrefRaw from '@/data/crossref_data.json';
const data = crossrefRaw as CrossRefData;
```

### Hook APIs

**useSearch** - Debounced search (150ms):
```typescript
const { results, isSearching, query, setQuery } = useSearch();
```

**useCart** - BOM management with localStorage persistence:
```typescript
const { items, addItem, removeItem, updateQuantity, clearCart, totalMSRP } = useCart();
```

**useVoice** - Web Speech API:
```typescript
const { isListening, startListening, stopListening, transcript } = useVoice();
```

### Data File Structures

**crossref_data.json:**
```json
{
  "mappings": [{
    "competitor": "COMPETITOR-MODEL",
    "manufacturer": "Manufacturer Name",
    "axis_replacements": ["AXIS-MODEL-1"],
    "notes": "Optional migration notes"
  }]
}
```

**axis_msrp_data.json:**
```json
{
  "AXIS-MODEL-1": { "msrp": 1299.00, "description": "Product description" }
}
```

After updating data files: run `npm run typecheck` then `npm test`.

## Testing

Tests in `tests/` use Vitest with `@testing-library/jest-dom` matchers:
- `search.test.ts` - Fuzzy matching, query parsing, search engine
- `url.test.ts` - URL resolution cascade

## Deployment

`npm run deploy` runs type checking, builds for production, and deploys to Vercel. Requires `npx vercel login` before first deploy.

## Roadmap

See `.agent-os/product/roadmap.md` for current development phases and priorities.
