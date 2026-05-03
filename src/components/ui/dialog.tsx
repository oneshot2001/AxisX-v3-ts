/**
 * Dialog — shadcn-style primitive over Radix Dialog.
 *
 * Wraps Radix Dialog with the AxisX/Swift visual idiom:
 *   - `bg-ink/40 backdrop-blur-sm` overlay
 *   - rounded-xl modal panel on `bg-surface` with hairline border + shadow-lg
 *   - Framer Motion spring entry (stiffness ~420, damping ~34)
 *
 * Mirrors the shadcn API so consumers can use `<Dialog>`, `<DialogContent>`,
 * `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>`, `<DialogFooter>`.
 *
 * Top-level rendered surface is wrapped in `<div data-swift>` so the scoped
 * Tailwind reset in `index.css` applies to dialog children even though Radix
 * portals them out of any ambient `data-swift` ancestor.
 */

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Hide the default close (X) button in the corner */
  hideClose?: boolean;
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} asChild {...props}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 4 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
        data-swift
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border border-hairline bg-surface text-ink shadow-lg',
          'p-6',
          'focus:outline-none',
          className
        )}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              'absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full',
              'text-ink-muted transition-colors',
              'hover:bg-secondary hover:text-ink',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface'
            )}
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 pr-8', className)}
      {...props}
    />
  );
}
DialogHeader.displayName = 'DialogHeader';

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end',
        className
      )}
      {...props}
    />
  );
}
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-[18px] font-semibold leading-tight tracking-tight text-ink',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] text-ink-muted', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
