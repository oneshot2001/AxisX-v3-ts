# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent OS Documentation

### Product Context
- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Development Standards
- **Code Style:** @~/.agent-os/standards/code-style.md
- **Best Practices:** @~/.agent-os/standards/best-practices.md

### Project Management
- **Active Specs:** @.agent-os/specs/
- **Spec Planning:** Use `@~/.agent-os/instructions/create-spec.md`
- **Tasks Execution:** Use `@~/.agent-os/instructions/execute-tasks.md`

## Project Overview

AxisX v3 is a camera cross-reference tool helping sales professionals find Axis Communications camera replacements for competitor models. Built with TypeScript and React, emphasizing 100% type safety.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (port 5173, auto-opens browser)
npm run dev

# Run tests
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- path/to/file    # Single test file
npm run test:ui             # Visual test UI
npm run test:coverage       # Coverage report

# Type checking and linting
npm run typecheck           # TypeScript validation only
npm run lint                # ESLint

# Production
npm run build               # Build for production
npm run preview             # Preview production build
npm run deploy              # Build + deploy to Vercel
```

## Architecture

### Core Principle: Separation of Concerns
- **`src/core/`** - Pure business logic with no React dependencies. All algorithms and data processing live here.
- **`src/hooks/`** - React hooks that wrap core logic for component use
- **`src/components/`** - React UI components
- **`src/types/index.ts`** - Single source of truth for all TypeScript types (764 lines, 12 organized sections)

### Search System Flow
1. Query enters `src/core/search/queryParser.ts` → detects type (competitor, legacy, axis-model, manufacturer)
2. `src/core/search/engine.ts` routes to appropriate handler
3. `src/core/search/fuzzy.ts` performs Levenshtein-based matching
4. Results grouped by quality: exact → partial → similar

### URL Resolution Cascade (src/core/url/)
Four-step cascade for 100% URL accuracy:
1. **Verified URLs** (`verified.ts`) - Hardcoded known-good URLs
2. **Model Aliases** (`aliases.ts`) - Typo/variant corrections
3. **Base Model** - Strip suffixes and retry
4. **Search Fallback** - axis.com/products?q=

### Key Data Files
- `src/data/crossref_data.json` - Competitor→Axis mappings
- `src/data/axis_msrp_data.json` - Price lookup table

## Type System

All types in `src/types/index.ts`. Key types:

```typescript
SearchResponse       // Complete search result with grouping & confidence
CompetitorMapping    // Competitor model → Axis replacement
LegacyAxisMapping    // Discontinued Axis → current replacement
ResolvedURL          // URL with confidence level & resolution method
CartItem             // Shopping cart item with quantity
```

Use path aliases for imports:
```typescript
import type { SearchResult, CartItem } from '@/types';
import { createSearchEngine } from '@/core/search';
import { useCart } from '@/hooks';
```

## Category System

Competitor categories for filtering/display (defined in types):
- **NDAA** - Section 889 banned: Hikvision, Dahua, Uniview
- **Cloud** - Subscription-based: Verkada, Rhombus
- **Korean** - Hanwha Vision, Samsung legacy
- **Japanese** - i-PRO, Panasonic
- **Motorola** - Avigilon, Pelco

## Testing

Tests in `tests/` directory using Vitest. Test files follow `*.test.ts` pattern.

Current test coverage:
- `tests/search.test.ts` - Fuzzy matching, search engine, query parsing
- `tests/url.test.ts` - URL resolution

## Contributing Rules

1. All code must be TypeScript (no `.js` files in `src/`)
2. Run `npm run typecheck` before committing
3. Add tests for new features in `tests/`
4. Update `src/types/index.ts` when changing data structures
5. Core business logic goes in `src/core/` (no React imports)
