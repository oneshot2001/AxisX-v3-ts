# Product Roadmap

> Last Updated: 2026-02-04
> Version: 1.0.0
> Status: Phase 1 - UI Migration

## Phase 0: Already Completed

The following features have been implemented in the v3 TypeScript codebase:

### Type System
- [x] Complete TypeScript type system (764 lines, 12 organized sections)
- [x] Centralized types in `src/types/index.ts`
- [x] Strict mode with all safety flags enabled
- [x] Path aliases configured (@ → src/)

### Search Engine
- [x] **Query Parser** - Detects query type (competitor, legacy, axis-model, manufacturer)
- [x] **Fuzzy Matching** - Levenshtein distance algorithm for typo tolerance
- [x] **Search Engine** - Intelligent routing to appropriate handler
- [x] **Result Grouping** - Exact → Partial → Similar quality tiers

### URL Resolution
- [x] **Verified URLs** - Hardcoded known-good URLs for popular models
- [x] **Model Aliases** - Common typo/variant corrections
- [x] **Variant Stripping** - Remove frequency, regional, hardware suffixes
- [x] **Search Fallback** - axis.com/products?q= as final fallback

### Data Systems
- [x] **MSRP Lookup** - Price data for Axis models
- [x] **Competitor Mappings** - Competitor→Axis replacement database
- [x] **Legacy Mappings** - Discontinued→Current Axis upgrades
- [x] **NDAA Categories** - Compliance status for competitor brands

### React Integration
- [x] **useSearch Hook** - Search functionality for components
- [x] **useVoice Hook** - Web Speech API integration
- [x] **useCart Hook** - BOM cart state management

### Build & Test Infrastructure
- [x] Vite build configuration with code splitting
- [x] Vitest test framework setup
- [x] ESLint + TypeScript strict linting
- [x] Path alias configuration

## Phase 1: Port v2 UI to v3 (Current)

**Goal:** Migrate the proven v2 React components to TypeScript while maintaining all functionality.
**Success Criteria:** Feature parity with v2 production app at axisx-dev.vercel.app

### Must-Have Features

- [x] Migrate search input component with voice toggle `M`
- [x] Migrate search results display with grouping `M`
- [ ] Migrate BOM cart component with quantity controls `M`
- [ ] Migrate PDF export functionality `S`
- [ ] Migrate CSV export functionality `S`
- [ ] Implement responsive layout matching v2 `M`

### Should-Have Features

- [x] Add loading states and error handling `S`
- [x] Implement keyboard shortcuts (Enter to search) `XS`
- [x] Add clear/reset functionality `XS`

### Dependencies

- Core business logic (completed in Phase 0)
- Type definitions (completed in Phase 0)

## Phase 2: Enhanced Features

**Goal:** Improve upon v2 with features that leverage the new type-safe architecture.
**Success Criteria:** Measurable improvements in user workflow efficiency

### Must-Have Features

- [ ] Mount recommendations UI with visual selector `L`
- [ ] Enhanced batch processing for multiple cameras `M`
- [ ] Search history and recent lookups `S`

### Should-Have Features

- [ ] Analytics dashboard for usage patterns `M`
- [ ] Saved BOM templates `M`
- [ ] Comparison view for multiple Axis options `M`

### Dependencies

- Phase 1 UI migration complete
- User feedback from v3 beta testing

## Phase 3: Mobile/PWA

**Goal:** Optimize for field use with offline support and mobile-first experience.
**Success Criteria:** Fully functional offline; native-like mobile experience

### Must-Have Features

- [ ] Service worker for offline capability `L`
- [ ] Mobile-optimized touch UI `L`
- [ ] Voice-first workflow optimization `M`
- [ ] Offline data sync strategy `M`

### Should-Have Features

- [ ] Camera integration for model number OCR `XL`
- [ ] Push notifications for price updates `M`
- [ ] App store packaging (PWA to native) `L`

### Dependencies

- Phase 2 features complete
- PWA best practices research

## Effort Scale

- **XS:** 1 day
- **S:** 2-3 days
- **M:** 1 week
- **L:** 2 weeks
- **XL:** 3+ weeks
