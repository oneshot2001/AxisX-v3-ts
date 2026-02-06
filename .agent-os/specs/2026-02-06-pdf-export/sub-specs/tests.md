# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-02-06-pdf-export/spec.md

> Created: 2026-02-06
> Version: 1.0.0

## Test Coverage

### Unit Tests

**pdfGenerator.ts** (`tests/export.test.ts`)

- Generates a jsPDF document from cart items without throwing
- Includes project name and customer name in the document
- Handles empty features array (no "Why Switch" section)
- Handles items with null MSRP (shows "Price TBD")
- Handles items without competitor info (source: 'direct')
- Handles single item cart
- Handles large cart (20+ items) with page breaks
- Sanitizes project name for filename (special chars, spaces)
- Uses fallback filename when project name is empty

### Integration Tests

**ExportDialog** (`tests/components/ExportDialog.test.tsx`)

- Renders dialog when open
- Closes dialog on Cancel
- Calls generate callback with project and customer name
- Disables Generate button when both fields are empty
- Trims whitespace from inputs

**Cart with Export** (`tests/components/Cart.test.tsx` additions)

- Shows Export PDF button in cart footer
- Export PDF button is disabled when cart is empty
- Export PDF button is enabled when cart has items
- Clicking Export PDF opens the export dialog

### Mocking Requirements

- **jsPDF**: Mock the jsPDF constructor and its methods (`text`, `setFontSize`, `setTextColor`, `setFillColor`, `rect`, `addPage`, `save`, `internal.getNumberOfPages`) to verify correct calls without generating actual PDF binary data
- **Date**: Mock `Date` for deterministic filename timestamps in tests
