# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2026-02-06-pdf-export/spec.md

> Created: 2026-02-06
> Status: Ready for Implementation

## Tasks

- [x] 1. Add types and create PDF generator core
  - [x] 1.1 Add `BattleCardOptions` and `ExportMetadata` types to `src/types/index.ts`
  - [x] 1.2 Write tests for `generateBattleCardPDF` in `tests/export.test.ts`
  - [x] 1.3 Create `src/core/export/pdfGenerator.ts` with `generateBattleCardPDF` function
  - [x] 1.4 Create `src/core/export/index.ts` barrel export
  - [x] 1.5 Verify all tests pass

- [x] 2. Create export hook and dialog component
  - [x] 2.1 Write tests for `ExportDialog` in `tests/components/ExportDialog.test.tsx`
  - [x] 2.2 Create `src/components/ExportDialog.tsx` with Fluent UI Dialog
  - [x] 2.3 Create `src/hooks/useExportPDF.ts` hook wrapping core generator
  - [x] 2.4 Export from `src/hooks/index.ts` and `src/components/index.ts`
  - [x] 2.5 Verify all tests pass

- [x] 3. Integrate into Cart and wire up in App
  - [x] 3.1 Write tests for Export PDF button in Cart (`tests/components/Cart.test.tsx`)
  - [x] 3.2 Add "Export PDF" button to Cart component footer
  - [x] 3.3 Wire up export dialog and hook in `App.tsx` cart view
  - [x] 3.4 Verify all tests pass
  - [ ] 3.5 Manual test: build BOM, export PDF, verify layout and content
