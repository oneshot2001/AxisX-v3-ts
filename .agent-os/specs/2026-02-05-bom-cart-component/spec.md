# Spec Requirements Document

> Spec: BOM Cart Component
> Created: 2026-02-05
> Status: Planning

## Overview

Create a complete Cart component that displays the BOM (Bill of Materials) with item list, summary totals, and cart actions. The component uses existing `CartItemRow` for individual items and `useCart` hook for state management.

## User Stories

### Managing a Multi-Camera Quote

As a sales professional, I want to see all cameras in my BOM cart at a glance, so that I can review quantities and pricing before sharing with a customer.

After searching for multiple competitor cameras and adding their Axis replacements, the user opens the cart panel to review. They see all items with quantities, individual line totals, and a summary showing total MSRP. They can adjust quantities directly in the cart or remove items they no longer need.

### Clearing and Starting Fresh

As a sales professional, I want to clear my entire cart with one action, so that I can quickly start a new quote without manually removing each item.

After completing a customer quote, the user clicks "Clear Cart" to remove all items and prepare for the next customer.

## Spec Scope

1. **Cart Component** - Main container displaying cart header, item list, and summary footer
2. **Cart Header** - Shows item count with "BOM Cart" title
3. **Item List** - Renders CartItemRow for each item, handles empty state
4. **Summary Footer** - Displays total MSRP with unknown price indicator
5. **Clear Cart Action** - Button to remove all items with confirmation
6. **localStorage Persistence** - Cart state persists across page refreshes

## Out of Scope

- PDF export functionality (separate Phase 1 item)
- CSV export functionality (separate Phase 1 item)
- Cart panel/drawer animation (enhancement for later)
- Multi-cart or saved cart templates (Phase 2 feature)

## Expected Deliverable

1. User can see all cart items with quantities and totals in a dedicated Cart component
2. User can clear all cart items with a single action
3. Cart state persists in localStorage across page refreshes
4. Empty cart displays a helpful message encouraging item addition

## Spec Documentation

- Tasks: @.agent-os/specs/2026-02-05-bom-cart-component/tasks.md
- Technical Specification: @.agent-os/specs/2026-02-05-bom-cart-component/sub-specs/technical-spec.md
- Tests Specification: @.agent-os/specs/2026-02-05-bom-cart-component/sub-specs/tests.md
