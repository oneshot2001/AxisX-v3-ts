# Spec Requirements Document

> Spec: Search Results V2 Parity
> Created: 2026-02-05
> Status: Planning

## Overview

Enhance the existing SearchResults and ResultCard components to achieve feature parity with the v2 production app at axisx-dev.vercel.app. The v3 components have the core grouping structure but lack the detailed spec comparison, category filtering, and sales-focused notes display that make v2 effective for field sales reps.

## User Stories

### Field RSM Comparing Options

As a Regional Sales Manager, I want to see a side-by-side comparison of competitor specs vs Axis specs, so that I can quickly articulate the value proposition during customer meetings.

When searching for a competitor camera, I should see:
- The competitor's resolution, form factor, and key features
- The Axis replacement's resolution and features side-by-side
- Clear notes explaining why this is the right swap

### Category-Based Filtering

As a sales rep working on an NDAA compliance project, I want to filter results by category (NDAA, Cloud, etc.), so that I can focus on the specific displacement scenario I'm working on.

The v2 app has filter buttons for: All, Cloud, NDAA, Bankrupt, Canon Family, Competitive. These should be available in v3.

### Quick Confidence Assessment

As a sales rep, I want to see a clear HIGH/MEDIUM confidence badge on each result, so that I can immediately gauge how solid the recommendation is.

## Spec Scope

1. **Category Filter Pills** - Add filter buttons above results matching v2 style (All, Cloud, NDAA, Defunct, Family, Competitive)

2. **Enhanced ResultCard** - Add two-column spec comparison showing competitor specs vs Axis specs side-by-side

3. **Feature Lists** - Display competitor features and Axis features in the spec comparison

4. **Notes Section** - Add sales-focused notes with yellow left border styling from v2

5. **Confidence Badge** - Replace the "92% match" text with styled HIGH/MEDIUM confidence badges

## Out of Scope

- PDF/CSV export (separate roadmap item)
- BOM cart component (separate roadmap item)
- Voice input changes (already complete)
- Batch search mode (Phase 2 feature)

## Expected Deliverable

1. Search results display matches v2 visual design with category filters and spec comparison
2. Users can filter results by manufacturer category
3. ResultCard shows complete spec comparison with notes and confidence badge
4. All existing functionality (grouping, add to cart, Axis.com links) preserved

## Spec Documentation

- Tasks: @.agent-os/specs/2026-02-05-search-results-parity/tasks.md
- Technical Specification: @.agent-os/specs/2026-02-05-search-results-parity/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2026-02-05-search-results-parity/sub-specs/tests.md
