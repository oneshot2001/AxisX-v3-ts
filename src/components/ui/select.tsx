/**
 * Select — minimal shadcn-style wrapper around the native <select> element.
 *
 * Why native: the brief calls for a Radix Select primitive but the workspace
 * has a hard "no installs" rule and `@radix-ui/react-select` is not in the
 * dep tree. The native element gives us:
 *   - Full keyboard semantics (Up/Down, Enter, type-to-jump)
 *   - Mobile-native picker (no bespoke popover plumbing)
 *   - Zero new bundle weight
 *   - Real `<option>` elements that React Testing Library can drive directly.
 *
 * The visual chrome matches the rest of the swift surface (rounded-md +
 * border-hairline + axis-yellow focus ring) and the public API
 * (`value` / `onValueChange` / `<SelectItem value=...>`) mirrors the shadcn
 * Radix variant so the call sites stay swap-ready when Radix lands.
 */

import {
  forwardRef,
  Children,
  isValidElement,
  type SelectHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// SELECT
// =============================================================================

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  /** `<SelectItem>` children (or raw `<option>` for advanced cases). */
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      onValueChange(event.target.value);
    };

    // Translate `<SelectItem>` children -> `<option>` so we can render in a
    // native <select>. `SelectItem` also stays renderable in JSX as a real
    // component to keep ergonomics shadcn-shaped.
    const options = Children.map(children, (child) => {
      if (!isValidElement<SelectItemProps>(child)) return child;
      const { value: itemValue, children: itemChildren, disabled } = child.props;
      return (
        <option value={itemValue} disabled={disabled}>
          {itemChildren}
        </option>
      );
    });

    return (
      <div className="relative inline-flex w-full items-center">
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          className={cn(
            'h-9 w-full appearance-none rounded-md border border-hairline bg-surface pl-3 pr-8 text-[13px] text-ink shadow-sm',
            'transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {options}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-2.5 size-3.5 text-ink-faint"
        />
      </div>
    );
  }
);
Select.displayName = 'Select';

// =============================================================================
// SELECT ITEM (logical wrapper — rendered as <option> by Select)
// =============================================================================

export interface SelectItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function SelectItem(_props: SelectItemProps) {
  // This component is "virtual" — Select inspects its props and renders a
  // real <option>. Returning null prevents accidental double-render if a
  // caller drops it outside a <Select>.
  return null;
}
SelectItem.displayName = 'SelectItem';
