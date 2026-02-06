/**
 * Battle Card PDF Generator
 *
 * Pure function that creates an Axis-branded "Battle Card" PDF
 * from BOM cart data. Ported from v2's generateBattleCardPDF.
 *
 * No React dependencies - follows v3 three-layer architecture.
 */

import { jsPDF } from 'jspdf';
import type { BattleCardOptions, CartItem } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const MARGIN = 14;
const CONTENT_LEFT = 18;
const PAGE_BREAK_THRESHOLD = 270;

// Colors (RGB tuples)
const AXIS_YELLOW = [255, 204, 51] as const;
const TEXT_DARK = [35, 30, 15] as const;
const TEXT_GRAY = [100, 100, 100] as const;
const TEXT_LIGHT_GRAY = [150, 150, 150] as const;
const TEXT_GREEN = [0, 100, 50] as const;
const TEXT_NOTES_GRAY = [80, 80, 80] as const;
const BG_CARD = [245, 245, 245] as const;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Strip special characters from a string for safe filenames.
 * Replaces spaces with hyphens, removes anything not alphanumeric/hyphen/underscore.
 */
export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Build a timestamped filename for the PDF export.
 * Falls back to "Export" when project name is empty.
 */
export function buildFilename(projectName: string, date: Date): string {
  const sanitized = sanitizeFilename(projectName);
  const name = sanitized || 'Export';
  const timestamp = date.getTime();
  return `AxisX-BattleCard-${name}-${timestamp}.pdf`;
}

// =============================================================================
// PDF GENERATION
// =============================================================================

/**
 * Estimate the vertical space needed for a single cart item card.
 */
function estimateItemHeight(item: CartItem): number {
  const baseHeight = 40;
  const featureLines = item.axisFeatures?.length ?? 0;
  const hasNotes = item.notes && item.notes.trim().length > 0;
  return baseHeight + (featureLines * 6) + (hasNotes ? 10 : 0);
}

/**
 * Draw the Axis-yellow header banner at the top of a page.
 */
function drawHeader(
  doc: jsPDF,
  pageWidth: number,
  dateStr: string,
  projectName: string,
  customerName: string,
): number {
  // Yellow banner
  doc.setFillColor(...AXIS_YELLOW);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Title
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AxisX Battle Card', MARGIN, 20);

  // Project info
  doc.setTextColor(...TEXT_GRAY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${dateStr}`, MARGIN, 40);

  let yPos = 40;
  if (projectName) {
    yPos += 6;
    doc.text(`Project: ${projectName}`, MARGIN, yPos);
  }
  if (customerName) {
    yPos += 6;
    doc.text(`Customer: ${customerName}`, MARGIN, yPos);
  }

  return yPos + 13;
}

/**
 * Draw the migration summary section.
 */
function drawSummary(
  doc: jsPDF,
  yPos: number,
  totalItems: number,
  totalQuantity: number,
  totalMSRP: number,
  unknownPriceCount: number,
): number {
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Migration Summary', MARGIN, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Cameras: ${totalItems}`, MARGIN, yPos);
  doc.text(`Total Quantity: ${totalQuantity}`, 80, yPos);
  yPos += 6;
  doc.text(`Total MSRP: $${totalMSRP.toLocaleString()}`, MARGIN, yPos);

  if (unknownPriceCount > 0) {
    yPos += 6;
    doc.setTextColor(...TEXT_NOTES_GRAY);
    doc.setFontSize(9);
    doc.text(`* ${unknownPriceCount} item(s) with unknown pricing not included in total`, MARGIN, yPos);
  }

  return yPos + 15;
}

/**
 * Draw a single cart item card.
 */
function drawItemCard(
  doc: jsPDF,
  item: CartItem,
  yPos: number,
  pageWidth: number,
): number {
  const itemHeight = estimateItemHeight(item);

  // Card background
  doc.setFillColor(...BG_CARD);
  doc.rect(MARGIN, yPos - 5, pageWidth - MARGIN * 2, itemHeight, 'F');

  // Competitor info (if present)
  if (item.competitorModel) {
    doc.setTextColor(...TEXT_GRAY);
    doc.setFontSize(9);
    const mfr = item.competitorManufacturer ?? '';
    doc.text(`REPLACING: ${mfr} ${item.competitorModel}`.trim(), CONTENT_LEFT, yPos + 2);
  }

  // Axis model
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`AXIS ${item.model}`, CONTENT_LEFT, yPos + 12);

  // Qty and MSRP
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Qty: ${item.quantity}`, CONTENT_LEFT, yPos + 22);

  const priceStr = item.msrp !== null
    ? `$${(item.msrp * item.quantity).toLocaleString()}`
    : 'Price TBD';
  doc.text(`MSRP: ${priceStr}`, 60, yPos + 22);

  // Axis URL
  if (item.axisUrl) {
    doc.setTextColor(...TEXT_GRAY);
    doc.setFontSize(7);
    doc.text(item.axisUrl, CONTENT_LEFT, yPos + 28);
  }

  let contentY = yPos + 32;

  // "Why Switch" selling points
  if (item.axisFeatures && item.axisFeatures.length > 0) {
    doc.setTextColor(...TEXT_GREEN);
    doc.setFontSize(8);
    for (const point of item.axisFeatures) {
      doc.text(`+ ${point}`, CONTENT_LEFT, contentY);
      contentY += 6;
    }
  }

  // Notes
  if (item.notes && item.notes.trim().length > 0) {
    doc.setTextColor(...TEXT_NOTES_GRAY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Note: ${item.notes}`, CONTENT_LEFT, contentY);
    doc.setFont('helvetica', 'normal');
    contentY += 6;
  }

  return yPos + itemHeight + 8;
}

/**
 * Generate a Battle Card PDF document from cart data.
 *
 * Returns the jsPDF instance. Caller decides whether to .save() or .output().
 */
export function generateBattleCardPDF(options: BattleCardOptions): jsPDF {
  const { items, summary, projectName, customerName, generatedDate } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const dateStr = generatedDate.toLocaleDateString();

  // Header
  let yPos = drawHeader(doc, pageWidth, dateStr, projectName, customerName);

  // Summary
  yPos = drawSummary(
    doc,
    yPos,
    summary.uniqueModels,
    summary.totalQuantity,
    summary.totalMSRP,
    summary.unknownPriceCount,
  );

  // Item cards
  for (const item of items) {
    const itemHeight = estimateItemHeight(item);

    // Page break check
    if (yPos + itemHeight > PAGE_BREAK_THRESHOLD) {
      doc.addPage();
      yPos = drawHeader(doc, pageWidth, dateStr, projectName, customerName);
    }

    yPos = drawItemCard(doc, item, yPos, pageWidth);
  }

  // Footer on last page
  doc.setTextColor(...TEXT_LIGHT_GRAY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Generated by AxisX - Camera Cross-Reference Tool',
    MARGIN,
    doc.internal.pageSize.getHeight() - 10,
  );

  return doc;
}
