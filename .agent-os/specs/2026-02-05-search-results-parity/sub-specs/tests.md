# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-02-05-search-results-parity/spec.md

> Created: 2026-02-05
> Version: 1.0.0

## Test Coverage

### Unit Tests

**CategoryFilter Component**
- Renders all category buttons
- Highlights active category with correct styling
- Calls onCategoryChange when button clicked
- Displays result counts in badges
- Handles empty result counts gracefully

**ResultCard Spec Comparison**
- Renders competitor specs (resolution, form factor, features)
- Renders Axis specs (resolution, form factor, features)
- Handles missing competitor_resolution gracefully (shows "—")
- Handles missing axis_features gracefully (shows empty list)
- Handles missing notes gracefully (hides section)

**Confidence Badge**
- Renders "HIGH" badge for score >= 85
- Renders "MEDIUM" badge for score < 85
- Uses correct icon (CheckCircle vs AlertCircle)
- Uses correct color styling (green vs amber)

### Integration Tests

**SearchResults with Category Filter**
- Filters results when category selected
- Shows correct counts per category
- Preserves grouping (exact/partial/similar) after filtering
- Returns to full results when "All" selected
- Maintains expansion state across filter changes

**SearchResults → ResultCard Flow**
- Passes correct result data to ResultCard
- onAddToCart propagates from card to parent
- Category badge reflects result.category

### Component Render Tests

**ResultCard Visual Structure**
- Renders header with manufacturer badge
- Renders arrow and Axis model
- Renders spec comparison grid (2 columns)
- Renders notes section when notes exist
- Renders confidence badge
- Renders action buttons (View on Axis.com, Add to Cart)

**CategoryFilter Responsive Behavior**
- Buttons wrap on narrow viewport
- Active state visible on mobile

## Mocking Requirements

**SearchResponse Mock:**
```typescript
const mockSearchResponse: SearchResponse = {
  query: 'DS-2CD2143G2-I',
  queryType: 'competitor',
  results: [
    {
      score: 92,
      type: 'exact',
      mapping: {
        competitor_model: 'DS-2CD2143G2-I',
        competitor_manufacturer: 'Hikvision',
        axis_replacement: 'P3265-LVE',
        match_confidence: 92,
        competitor_type: 'outdoor dome',
        competitor_resolution: '4MP',
        axis_features: ['Lightfinder 2.0', 'Forensic WDR'],
        notes: 'NDAA-compliant replacement. Direct swap.',
      },
      isLegacy: false,
      axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
      category: 'ndaa',
    },
  ],
  grouped: { exact: [...], partial: [], similar: [] },
  suggestions: [],
  confidence: 'high',
  durationMs: 12,
  isBatch: false,
};
```

**Category Counts Mock:**
```typescript
const mockCategoryCounts: Record<CategoryId, number> = {
  all: 15,
  ndaa: 5,
  cloud: 3,
  korean: 2,
  japanese: 1,
  motorola: 2,
  taiwan: 1,
  competitive: 1,
  family: 0,
  defunct: 0,
  'legacy-axis': 0,
};
```

## Test File Structure

```
tests/
├── components/
│   ├── CategoryFilter.test.tsx   (NEW)
│   ├── ResultCard.test.tsx       (NEW - expand existing if present)
│   └── SearchResults.test.tsx    (NEW - expand existing if present)
└── setup.ts                      (existing)
```

## Testing Commands

```bash
# Run all component tests
npm test -- tests/components/

# Run specific test file
npm test -- tests/components/CategoryFilter.test.tsx

# Watch mode for TDD
npm test -- --watch tests/components/

# Coverage for components
npm run test:coverage -- tests/components/
```

## Acceptance Criteria

- [ ] All new components have >80% test coverage
- [ ] No console errors/warnings in tests
- [ ] Tests pass in CI environment (jsdom)
- [ ] Visual regressions caught by snapshot tests (optional)
