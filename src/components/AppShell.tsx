import type { ReactNode } from 'react';
import { Search, ListChecks, ShoppingBag, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { SegmentedNav, type SegmentedItem } from '@/components/ui/segmented-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AppView = 'search' | 'batch' | 'info';

interface AppShellProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  cartCount: number;
  cartTotal?: string;
  bomOpen: boolean;
  onOpenCart: () => void;
  children: ReactNode;
}

const NAV_ITEMS: ReadonlyArray<SegmentedItem<AppView>> = [
  { value: 'search', label: 'Search', icon: Search },
  { value: 'batch', label: 'Batch', icon: ListChecks },
  { value: 'info', label: 'About', icon: Info },
];

export function AppShell({
  view,
  onViewChange,
  cartCount,
  cartTotal,
  bomOpen,
  onOpenCart,
  children,
}: AppShellProps) {

  return (
    <div data-swift className="flex min-h-screen flex-col bg-canvas font-sans text-ink antialiased">
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-hairline/80',
          'bg-[oklch(1_0_0/0.72)] backdrop-blur-xl backdrop-saturate-150'
        )}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-5">
          <Logo />
          <SegmentedNav
            value={view}
            onValueChange={onViewChange}
            items={NAV_ITEMS}
            ariaLabel="Primary navigation"
          />
          <CartTrigger
            count={cartCount}
            total={cartTotal}
            active={bomOpen}
            onClick={onOpenCart}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-8 pt-2 text-center text-xs text-ink-faint">
        <span className="font-medium text-ink-muted">AxisX</span>
        <span className="mx-1.5 opacity-40">·</span>
        Camera cross-reference for Axis partners
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <a
      href="/"
      className="group inline-flex items-baseline gap-1.5 select-none"
      aria-label="AxisX home"
    >
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Axis<span className="text-axis-yellow-ink">X</span>
      </span>
      <span className="rounded-full border border-hairline px-1.5 py-px font-mono text-[10px] font-medium uppercase tracking-wide text-ink-faint">
        v3
      </span>
    </a>
  );
}

interface CartTriggerProps {
  count: number;
  total?: string;
  active: boolean;
  onClick: () => void;
}

function CartTrigger({ count, total, active, onClick }: CartTriggerProps) {
  const hasItems = count > 0;
  return (
    <Button
      onClick={onClick}
      variant={active ? 'default' : 'outline'}
      size="sm"
      className={cn(
        'relative h-8 gap-1.5 rounded-full pl-3 pr-3.5 text-[13px] transition-all',
        active && 'bg-axis-yellow text-ink hover:brightness-105',
        !active && hasItems && 'border-axis-yellow/40 bg-axis-yellow/8'
      )}
    >
      <ShoppingBag className="size-3.5" />
      <span className="font-medium">BOM</span>
      {hasItems && (
        <motion.span
          key={count}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          className={cn(
            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums',
            active ? 'bg-ink/10 text-ink' : 'bg-ink text-canvas'
          )}
        >
          {count}
        </motion.span>
      )}
      {total && hasItems && (
        <span className="hidden tabular-nums text-ink-muted sm:inline">{total}</span>
      )}
    </Button>
  );
}
