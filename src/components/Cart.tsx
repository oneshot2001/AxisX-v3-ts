import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, FileText } from 'lucide-react';
import type { CartItem, CartSummary } from '@/types';
import { CartItemRow } from './CartItemRow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CartProps {
  items: CartItem[];
  summary: CartSummary;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClear: () => void;
  onExportPDF?: () => void;
  title?: string;
  /** When true, render without an outer card frame (for use inside a Drawer). */
  embedded?: boolean;
}

export function Cart({
  items,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  onExportPDF,
  title = 'BOM Cart',
  embedded = false,
}: CartProps) {
  const isEmpty = items.length === 0;
  const itemCountLabel = summary.uniqueModels === 1 ? '1 item' : `${summary.uniqueModels} items`;

  return (
    <div
      data-swift
      className={cn(
        'flex h-full min-h-0 flex-col font-sans text-ink antialiased',
        !embedded && 'rounded-xl border border-hairline bg-surface shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-axis-yellow-soft text-axis-yellow-ink">
            <ShoppingBag className="size-4" />
          </span>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-ink-muted">
          {itemCountLabel}
        </span>
      </div>

      {/* Item list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <motion.div layout className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={(quantity) => onUpdateQuantity(item.id, quantity)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer / totals */}
      <div className="border-t border-hairline bg-surface-2 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-ink-faint">
              Total MSRP
            </span>
            {summary.unknownPriceCount > 0 && (
              <span className="mt-0.5 text-[11px] text-warning">
                {summary.unknownPriceCount} item{summary.unknownPriceCount !== 1 ? 's' : ''} with
                price TBD
              </span>
            )}
          </div>
          <motion.span
            key={summary.formattedTotal}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            className="text-2xl font-semibold tracking-tight tabular-nums text-ink"
          >
            {summary.formattedTotal}
          </motion.span>
        </div>

        <div className="mt-4 flex gap-2">
          {onExportPDF && (
            <Button
              onClick={onExportPDF}
              disabled={isEmpty}
              size="default"
              className="h-10 flex-1 gap-1.5 bg-axis-yellow text-ink shadow-sm hover:brightness-105 active:brightness-95 disabled:bg-secondary disabled:text-ink-faint disabled:shadow-none"
            >
              <FileText className="size-4" />
              Export PDF
            </Button>
          )}
          <Button
            onClick={onClear}
            disabled={isEmpty}
            variant="outline"
            size="default"
            aria-label="Clear BOM"
            className="h-10 gap-1.5 text-danger hover:bg-danger/8 hover:text-danger disabled:text-ink-faint disabled:hover:bg-transparent"
          >
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-axis-yellow-soft/50 text-axis-yellow-ink">
        <ShoppingBag className="size-6" />
      </span>
      <div>
        <div className="text-[14px] font-medium text-ink">Your BOM is empty</div>
        <div className="mt-1 text-[12px] text-ink-muted">
          Search for cameras and add them here
        </div>
      </div>
    </div>
  );
}
