# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-02-05-bom-cart-component/spec.md

> Created: 2026-02-05
> Version: 1.0.0

## Test Coverage

### Unit Tests

**Cart Component (`tests/components/Cart.test.tsx`)**

- Renders cart title and item count
- Renders CartItemRow for each item
- Displays empty state when no items
- Shows summary with formatted total MSRP
- Shows unknown price indicator when items have null MSRP
- Calls onUpdateQuantity when CartItemRow quantity changes
- Calls onRemoveItem when CartItemRow remove clicked
- Calls onClear when Clear Cart button clicked
- Clear button is disabled when cart is empty

**useCart localStorage Persistence (`tests/hooks/useCart.test.ts`)**

- Initializes with empty array when localStorage is empty
- Loads items from localStorage on initialization
- Saves items to localStorage when items change
- Handles corrupted localStorage data gracefully
- Clears localStorage when cart is cleared

### Integration Tests

**Cart and useCart Integration**

- Adding items persists to localStorage
- Removing items updates localStorage
- Clearing cart removes all from localStorage
- Page refresh restores cart state (simulated with unmount/remount)

## Mocking Requirements

- **localStorage:** Mock `localStorage.getItem` and `localStorage.setItem` for persistence tests
- **MSRP data:** Use existing test setup that initializes MSRP with test data

## Test Data

```typescript
const mockCartItem: CartItem = {
  id: 'test-1',
  model: 'P3265-LVE',
  msrp: 1299,
  quantity: 2,
  source: 'search',
  competitorModel: 'DS-2CD2143G2-I',
  competitorManufacturer: 'Hikvision',
  axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
};

const mockSummary: CartSummary = {
  uniqueModels: 2,
  totalQuantity: 5,
  totalMSRP: 7895,
  unknownPriceCount: 0,
  formattedTotal: '$7,895',
};
```
