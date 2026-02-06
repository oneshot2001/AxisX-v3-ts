# Spec Requirements Document

> Spec: PDF Export
> Created: 2026-02-06
> Status: Planning

## Overview

Port the v2 "Battle Card" PDF export to v3's TypeScript architecture. Users generate a branded PDF from their BOM cart containing project/customer info, a summary, and per-item replacement details with pricing. Uses jsPDF (already a dependency).

## User Stories

### Field Sales Proposal Generation

As a Regional Sales Manager, I want to export my BOM cart as a professional PDF, so that I can share a branded replacement proposal with customers on-site.

After building a BOM by searching competitor cameras and adding Axis replacements, the RSM clicks "Export PDF" in the cart footer. A dialog prompts for project name and customer name. The generated PDF includes Axis branding, a cost summary, and per-item cards showing which competitor camera each Axis model replaces and why.

### Integrator Quote Documentation

As a Security Integrator, I want a PDF export of my camera replacement list, so that I can attach it to formal project proposals with accurate pricing.

The integrator builds a multi-camera BOM from batch search results, enters the project and customer details, and generates a PDF with line-item pricing, quantities, and total MSRP suitable for inclusion in project documentation.

## Spec Scope

1. **PDF Generation Core** - Pure TypeScript function in `src/core/export/` that takes cart data and metadata, returns a jsPDF document
2. **Export Dialog** - Fluent UI dialog prompting for project name and customer name before generation
3. **Cart Integration** - "Export PDF" button in the Cart component footer, disabled when cart is empty
4. **Battle Card Layout** - Axis-branded PDF matching v2 layout: header with yellow banner, summary section, per-item cards with competitor/replacement info, footer

## Out of Scope

- Mount/accessory data in the PDF (deferred to Phase 2 mount recommendations)
- CSV export (separate roadmap item)
- PDF preview before download
- Saved export templates or presets
- Print-optimized CSS / browser print

## Expected Deliverable

1. Clicking "Export PDF" in the cart opens a dialog, user enters project/customer name, and a branded PDF downloads with all cart items, pricing, and replacement rationale
2. PDF generation works with 1-50+ cart items with automatic page breaks
3. All existing tests continue to pass

## Spec Documentation

- Tasks: @.agent-os/specs/2026-02-06-pdf-export/tasks.md
- Technical Specification: @.agent-os/specs/2026-02-06-pdf-export/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2026-02-06-pdf-export/sub-specs/tests.md
