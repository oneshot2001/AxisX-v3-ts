# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2026-02-05-search-results-parity/spec.md

> Created: 2026-02-05
> Status: Ready for Implementation

## Tasks

- [x] 1. Create CategoryFilter component
  - [x] 1.1 Write tests for CategoryFilter (renders, click handler, active state)
  - [x] 1.2 Create `src/components/CategoryFilter.tsx` with filter pill buttons
  - [x] 1.3 Add category counts display in badges
  - [x] 1.4 Export from `src/components/index.ts`
  - [x] 1.5 Verify all tests pass

- [x] 2. Enhance ResultCard with spec comparison
  - [x] 2.1 Write tests for spec comparison rendering
  - [x] 2.2 Add two-column grid for competitor vs Axis specs
  - [x] 2.3 Display resolution, form factor, features in each column
  - [x] 2.4 Handle missing data gracefully with "—" placeholders
  - [x] 2.5 Verify all tests pass

- [x] 3. Add Notes section to ResultCard
  - [x] 3.1 Write tests for notes rendering (present and absent)
  - [x] 3.2 Add notes section with yellow border styling
  - [x] 3.3 Only render when `mapping.notes` exists
  - [x] 3.4 Verify all tests pass

- [x] 4. Replace score display with Confidence Badge
  - [x] 4.1 Write tests for HIGH/MEDIUM badge logic
  - [x] 4.2 Create ConfidenceBadge sub-component or inline
  - [x] 4.3 Use lucide-react CheckCircle/AlertCircle icons
  - [x] 4.4 Verify all tests pass

- [x] 5. Integrate CategoryFilter with SearchResults
  - [x] 5.1 Write integration tests for filtering behavior
  - [x] 5.2 Add category state to SearchResults (self-contained)
  - [x] 5.3 Calculate category counts from search results
  - [x] 5.4 Filter results by category in SearchResults
  - [x] 5.5 Verify all tests pass

- [x] 6. Final validation and cleanup
  - [x] 6.1 Run full test suite (`npm test`) - 78 tests pass
  - [x] 6.2 Run type check (`npm run typecheck`) - passes
  - [ ] 6.3 Run linter (`npm run lint`) - ESLint config missing (pre-existing)
  - [ ] 6.4 Manual testing in browser with various queries
  - [ ] 6.5 Verify feature parity with v2 production app
