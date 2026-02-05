# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2026-02-05-bom-cart-component/spec.md

> Created: 2026-02-05
> Version: 1.0.0

## Technical Requirements

### Cart Component (`src/components/Cart.tsx`)

```typescript
export interface CartProps {
  /** Cart items from useCart */
  items: CartItem[];

  /** Cart summary from useCart */
  summary: CartSummary;

  /** Callback when item quantity changes */
  onUpdateQuantity: (id: string, quantity: number) => void;

  /** Callback when item is removed */
  onRemoveItem: (id: string) => void;

  /** Callback when cart is cleared */
  onClear: () => void;

  /** Optional title override (default: "BOM Cart") */
  title?: string;
}
```

### Component Structure

```
Cart
├── Header
│   ├── Title ("BOM Cart")
│   └── Item count badge
├── Item List (scrollable if many items)
│   ├── CartItemRow (for each item)
│   └── Empty State (when no items)
└── Footer
    ├── Summary totals
    │   ├── Total MSRP (formatted)
    │   └── Unknown price indicator (if any)
    └── Clear Cart button
```

### localStorage Persistence

Update `useCart` hook to persist cart state:

```typescript
const CART_STORAGE_KEY = 'axisx-cart';

// On initialization
const [items, setItems] = useState<CartItem[]>(() => {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
});

// On items change
useEffect(() => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}, [items]);
```

### Styling

- Use existing `theme` object for colors and spacing
- Cart header: bold title with count badge (primary color background)
- Empty state: centered message with muted text
- Summary footer: bordered top, background highlight
- Clear button: destructive style (error color, outlined)

## Approach Options

**Option A: Props-based component** (Selected)
- Cart receives all data and callbacks as props
- useCart stays in parent component
- Maximum flexibility for rendering context

**Option B: Self-contained component**
- Cart uses useCart internally
- Simpler API but less flexible
- Harder to test in isolation

**Rationale:** Props-based approach allows the Cart component to be used in different contexts (panel, page, modal) while keeping the hook logic separate and testable.

## External Dependencies

No new dependencies required. Uses existing:
- `lucide-react` for icons (ShoppingCart, Trash2)
- Existing `theme` object for styling
- Existing `CartItemRow` component
- Existing `CartItem` and `CartSummary` types
