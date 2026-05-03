import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import type { CartItem, CartSummary } from '@/types';
import { Cart } from './Cart';
import { cn } from '@/lib/utils';

export interface BomDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  summary: CartSummary;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onExportPDF: () => void;
}

/**
 * Slide-down BOM drawer. On desktop it anchors to the right (large) and
 * on mobile it becomes a full bottom sheet via vaul. Body scroll is locked
 * while open. Closes on outside click, Escape, or the X button.
 */
export function BomDrawer({
  open,
  onOpenChange,
  items,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  onExportPDF,
}: BomDrawerProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Drawer.Content
          aria-describedby={undefined}
          className={cn(
            'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
            'duration-300 ease-out'
          )}
        >
          <Drawer.Title className="sr-only">Bill of Materials</Drawer.Title>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close BOM"
            className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-ink-muted backdrop-blur-md transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="size-4" />
          </button>
          <Cart
            items={items}
            summary={summary}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onClear={onClear}
            onExportPDF={onExportPDF}
            embedded
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
