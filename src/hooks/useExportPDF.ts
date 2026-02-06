/**
 * useExportPDF Hook
 *
 * Wraps the core PDF generator with React state management.
 * Manages dialog open/close, generation state, and download trigger.
 */

import { useState, useCallback } from 'react';
import type { CartItem, CartSummary, ExportMetadata } from '@/types';
import { generateBattleCardPDF, buildFilename } from '@/core/export';

// =============================================================================
// TYPES
// =============================================================================

export interface UseExportPDFReturn {
  /** Whether the export dialog is open */
  isDialogOpen: boolean;

  /** Open the export dialog */
  openDialog: () => void;

  /** Close the export dialog */
  closeDialog: () => void;

  /** Generate and download the PDF */
  generatePDF: (metadata: ExportMetadata) => void;

  /** Whether PDF generation is in progress */
  isGenerating: boolean;
}

export interface UseExportPDFOptions {
  /** Cart items to export */
  items: readonly CartItem[];

  /** Cart summary for totals */
  summary: CartSummary;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useExportPDF({ items, summary }: UseExportPDFOptions): UseExportPDFReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const generatePDF = useCallback((metadata: ExportMetadata) => {
    setIsGenerating(true);

    try {
      const now = new Date();
      const doc = generateBattleCardPDF({
        items,
        summary,
        projectName: metadata.projectName,
        customerName: metadata.customerName,
        generatedDate: now,
      });

      const filename = buildFilename(metadata.projectName, now);
      doc.save(filename);
    } finally {
      setIsGenerating(false);
      setIsDialogOpen(false);
    }
  }, [items, summary]);

  return {
    isDialogOpen,
    openDialog,
    closeDialog,
    generatePDF,
    isGenerating,
  };
}
