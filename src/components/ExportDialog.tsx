/**
 * ExportDialog — Apple/Swift visual rewrite (Tailwind v4 + Radix Dialog + Framer Motion).
 *
 * Modal that captures Project Name + Customer Name before generating a Battle
 * Card PDF. Replaces the previous Fluent UI Dialog with the shadcn-style Radix
 * Dialog primitive in `components/ui/dialog.tsx`.
 *
 * Public API (`ExportDialogProps`) is unchanged from the Fluent version.
 */

import { useState, useCallback } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import type { ExportMetadata } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ExportDialogProps {
  /** Whether the dialog is open */
  open: boolean;

  /** Called when the dialog should close */
  onClose: () => void;

  /** Called with metadata when user clicks Generate PDF */
  onGenerate: (metadata: ExportMetadata) => void;

  /** Whether PDF generation is in progress */
  isGenerating?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ExportDialog({
  open,
  onClose,
  onGenerate,
  isGenerating = false,
}: ExportDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');

  const handleGenerate = useCallback(() => {
    onGenerate({
      projectName: projectName.trim(),
      customerName: customerName.trim(),
    });
  }, [projectName, customerName, onGenerate]);

  const handleClose = useCallback(() => {
    setProjectName('');
    setCustomerName('');
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md',
                'bg-axis-yellow-soft text-axis-yellow-ink'
              )}
              aria-hidden
            >
              <FileText className="size-4" strokeWidth={2} />
            </span>
            <DialogTitle>Export Battle Card PDF</DialogTitle>
          </div>
          <DialogDescription>
            Add project metadata to brand the generated PDF header.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-project-name">Project Name</Label>
            <Input
              id="export-project-name"
              placeholder="e.g., Acme Corp Camera Upgrade"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-customer-name">Customer Name</Label>
            <Input
              id="export-customer-name"
              placeholder="e.g., John Smith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              'h-9 gap-1.5 bg-axis-yellow text-ink shadow-sm',
              'hover:brightness-105 active:brightness-95',
              'disabled:pointer-events-none disabled:opacity-60'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="size-3.5" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
