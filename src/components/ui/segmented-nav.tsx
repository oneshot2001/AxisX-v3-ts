import { motion, LayoutGroup } from 'framer-motion';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';
import type { ComponentType, ReactNode } from 'react';

export interface SegmentedItem<V extends string> {
  value: V;
  label: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}

export interface SegmentedNavProps<V extends string> {
  value: V;
  onValueChange: (value: V) => void;
  items: ReadonlyArray<SegmentedItem<V>>;
  ariaLabel: string;
  className?: string;
  layoutId?: string;
}

export function SegmentedNav<V extends string>({
  value,
  onValueChange,
  items,
  ariaLabel,
  className,
  layoutId = 'segmented-active',
}: SegmentedNavProps<V>) {
  const handleChange = (next: string) => {
    if (!next) return;
    onValueChange(next as V);
  };

  return (
    <LayoutGroup id={layoutId}>
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={handleChange}
        aria-label={ariaLabel}
        className={cn(
          'relative inline-flex items-center gap-0.5 rounded-full border border-hairline bg-[oklch(0.97_0_0/0.7)] p-1 backdrop-blur-md',
          className
        )}
      >
        {items.map((item) => {
          const isActive = item.value === value;
          const Icon = item.icon;
          return (
            <ToggleGroup.Item
              key={item.value}
              value={item.value}
              className={cn(
                'relative z-10 inline-flex h-8 select-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm"
                  transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
                />
              )}
              {Icon && <Icon className="size-3.5" />}
              {item.label}
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
    </LayoutGroup>
  );
}
