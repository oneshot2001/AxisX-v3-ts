# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2026-02-05-search-results-parity/spec.md

> Created: 2026-02-05
> Version: 1.0.0

## Technical Requirements

### 1. Category Filter Component

Create a new `CategoryFilter` component that:
- Displays filter pills horizontally (flex-wrap for mobile)
- Highlights active filter with Axis yellow background
- Filters are: All, Cloud, NDAA, Defunct, Family, Competitive
- Clicking a filter updates the parent state and filters visible results
- Maps to `CategoryId` type from `src/types/index.ts`

**Props Interface:**
```typescript
interface CategoryFilterProps {
  activeCategory: CategoryId;
  onCategoryChange: (category: CategoryId) => void;
  resultCounts: Record<CategoryId, number>; // Show count badges
}
```

### 2. Enhanced ResultCard with Spec Comparison

Update `ResultCard.tsx` to include a two-column spec comparison grid:

**Left Column (Competitor):**
- Resolution (from `competitor_resolution`)
- Form factor (from `competitor_type`)
- Features list (from `CompetitorMapping.features` if available, or parse from type)

**Right Column (Axis):**
- Resolution (derive from model or add to mapping)
- Form factor (same as competitor)
- Features list (from `axis_features`)

**Visual styling:**
- Left column: `bg-zinc-800` with zinc border
- Right column: `bg-[#FFCC33]/10` with yellow border
- Match v2 visual hierarchy

### 3. Notes Section

Add notes display below spec comparison:
- Yellow left border (`border-l-2 border-[#FFCC33]`)
- Background: `bg-zinc-800/50`
- "Notes:" label in bold white
- Notes text from `mapping.notes`

### 4. Confidence Badge

Replace current `{result.score}% match` with styled badge:
- Score >= 85: Green "HIGH" badge with CheckCircle icon
- Score < 85: Amber "MEDIUM" badge with AlertCircle icon
- Use lucide-react icons (already in dependencies)

### 5. SearchResults State Management

Update `SearchResults.tsx` to:
- Accept `onCategoryChange` and `activeCategory` props
- Filter results by category before grouping
- Pass category counts to CategoryFilter component
- Preserve grouping logic (exact/partial/similar)

## Data Requirements

The `CompetitorMapping` interface already has:
- `competitor_resolution?: string`
- `competitor_type?: string` (form factor)
- `axis_features?: readonly string[]`
- `notes?: string`
- `match_confidence: number`

**Missing data fields to add to types if needed:**
- Competitor features array (currently may be in `competitor_type` or notes)

For mappings that lack detailed data, display gracefully with "—" placeholders.

## Component Hierarchy

```
SearchView (App.tsx)
├── SearchInput (existing)
├── CategoryFilter (new)
└── SearchResults (enhanced)
    ├── ResultSection (existing)
    │   └── ResultCard (enhanced)
    │       ├── Header (manufacturer + model)
    │       ├── SpecComparison (new)
    │       │   ├── CompetitorSpecs
    │       │   └── AxisSpecs
    │       ├── Notes (new)
    │       ├── ConfidenceBadge (new)
    │       └── ActionButtons (existing)
    └── NoResults (existing)
```

## Styling Approach

Continue using inline styles with `theme` object for consistency. Key colors:
- `theme.colors.primary` (#FFCC33) - Axis yellow
- `theme.colors.bgAlt` - Card backgrounds
- `theme.colors.ndaa` - NDAA red badge
- `theme.colors.cloud` - Cloud purple badge

V2 uses Tailwind classes; v3 uses inline styles. Translate visual appearance, not class names.

## Performance Considerations

- Category filtering should happen client-side (data is already loaded)
- Avoid re-rendering entire list on category change (React keys stable)
- Spec comparison adds ~100 bytes per card; negligible impact

## External Dependencies

No new dependencies required. Use existing:
- `lucide-react` for CheckCircle and AlertCircle icons

## File Changes Summary

| File | Change Type |
|------|-------------|
| `src/components/CategoryFilter.tsx` | NEW |
| `src/components/ResultCard.tsx` | MODIFY - add spec comparison, notes, confidence badge |
| `src/components/SearchResults.tsx` | MODIFY - add category filter integration |
| `src/components/index.ts` | MODIFY - export CategoryFilter |
| `src/App.tsx` | MODIFY - add category state, pass to SearchResults |
