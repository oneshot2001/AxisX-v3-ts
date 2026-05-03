import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CartItem } from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { cn } from '@/lib/utils';

export interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

function formatLineTotal(msrp: number | null, quantity: number): string {
  if (msrp === null) return 'TBD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(msrp * quantity);
}

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const unitPrice = getFormattedPrice(item.model);
  const lineTotal = formatLineTotal(item.msrp, item.quantity);
  const isAccessory = item.source === 'accessory';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 460, damping: 36 }}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-hairline bg-surface px-3 py-2.5',
        'shadow-sm transition-shadow hover:shadow-md',
        isAccessory && 'ml-5 bg-surface-2'
      )}
    >
      {/* Model info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-mono text-[13px] font-semibold tracking-tight text-ink">
            {item.model}
          </span>
          {isAccessory && (
            <span className="rounded-full bg-secondary px-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
              accessory
            </span>
          )}
        </div>
        {item.competitorModel && (
          <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-faint">
            <span>Replaces</span>
            <ArrowRight className="size-3 shrink-0" />
            <span className="truncate">
              {item.competitorModel}
              {item.competitorManufacturer ? ` · ${item.competitorManufacturer}` : ''}
            </span>
          </div>
        )}
        <div className="mt-0.5 text-[11px] tabular-nums text-ink-muted">
          {unitPrice} each
        </div>
      </div>

      {/* Quantity stepper */}
      <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 p-0.5">
        <button
          type="button"
          onClick={() => onQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted',
            'transition-colors hover:bg-surface hover:text-ink',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
          )}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="min-w-6 text-center text-[13px] font-semibold tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantityChange(item.quantity + 1)}
          aria-label="Increase quantity"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Line total */}
      <div
        className={cn(
          'min-w-[5rem] text-right text-[13px] font-semibold tabular-nums',
          item.msrp === null ? 'text-ink-faint' : 'text-ink'
        )}
      >
        {lineTotal}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}
