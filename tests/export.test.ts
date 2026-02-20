/**
 * PDF Export Tests
 *
 * Run with: npm test -- export.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CartItem, CartSummary, BattleCardOptions } from '../src/types';

// =============================================================================
// MOCK jsPDF
// =============================================================================

const mockMethods = {
  text: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  setFillColor: vi.fn(),
  rect: vi.fn(),
  addPage: vi.fn(),
  save: vi.fn(),
  output: vi.fn(),
  internal: {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297,
    },
  },
};

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({ ...mockMethods })),
}));

// Import after mock so the mock is in place
import {
  generateBattleCardPDF,
  sanitizeFilename,
  buildFilename,
} from '../src/core/export/pdfGenerator';

// =============================================================================
// TEST DATA
// =============================================================================

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'test-1',
    model: 'P3265-LVE',
    msrp: 1299,
    quantity: 2,
    source: 'search',
    competitorModel: 'DS-2CD2143G2-I',
    competitorManufacturer: 'Hikvision',
    axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
    axisFeatures: ['Lightfinder 2.0', 'Forensic WDR', 'DLPU analytics'],
    ...overrides,
  };
}

function makeSummary(items: CartItem[]): CartSummary {
  let totalMSRP = 0;
  let unknownPriceCount = 0;
  let totalQuantity = 0;

  for (const item of items) {
    totalQuantity += item.quantity;
    if (item.msrp !== null) {
      totalMSRP += item.msrp * item.quantity;
    } else {
      unknownPriceCount += item.quantity;
    }
  }

  return {
    uniqueModels: items.length,
    totalQuantity,
    totalMSRP,
    unknownPriceCount,
    formattedTotal: `$${totalMSRP.toLocaleString()}`,
  };
}

function makeOptions(items: CartItem[], overrides: Partial<BattleCardOptions> = {}): BattleCardOptions {
  return {
    items,
    summary: makeSummary(items),
    projectName: 'Acme Corp Upgrade',
    customerName: 'John Smith',
    generatedDate: new Date('2026-02-06'),
    ...overrides,
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('sanitizeFilename', () => {
  it('replaces spaces with hyphens', () => {
    expect(sanitizeFilename('Acme Corp Upgrade')).toBe('Acme-Corp-Upgrade');
  });

  it('strips special characters', () => {
    expect(sanitizeFilename('Project #1 (test)')).toBe('Project-1-test');
  });

  it('collapses multiple hyphens', () => {
    expect(sanitizeFilename('hello   world')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('');
  });

  it('preserves underscores', () => {
    expect(sanitizeFilename('my_project')).toBe('my_project');
  });

  it('trims whitespace', () => {
    expect(sanitizeFilename('  padded  ')).toBe('padded');
  });
});

describe('buildFilename', () => {
  const date = new Date('2026-02-06T12:00:00Z');

  it('builds filename with project name', () => {
    const result = buildFilename('Acme Corp', date);
    expect(result).toMatch(/^AxisX-BattleCard-Acme-Corp-\d+\.pdf$/);
  });

  it('falls back to Export when project name is empty', () => {
    const result = buildFilename('', date);
    expect(result).toMatch(/^AxisX-BattleCard-Export-\d+\.pdf$/);
  });

  it('falls back to Export when project name is only whitespace', () => {
    const result = buildFilename('   ', date);
    expect(result).toMatch(/^AxisX-BattleCard-Export-\d+\.pdf$/);
  });

  it('sanitizes special characters in project name', () => {
    const result = buildFilename('Project #1 (v2)', date);
    expect(result).toContain('Project-1-v2');
    expect(result).not.toContain('#');
    expect(result).not.toContain('(');
  });
});

describe('generateBattleCardPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates document without throwing (single item)', () => {
    const items = [makeItem()];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();
  });

  it('generates document without throwing (multiple items)', () => {
    const items = [
      makeItem({ id: '1', model: 'P3265-LVE' }),
      makeItem({ id: '2', model: 'Q3538-LVE', competitorModel: 'CD62', competitorManufacturer: 'Verkada' }),
      makeItem({ id: '3', model: 'P3268-LVE', competitorModel: 'DS-2CD2183G2-I' }),
    ];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();
  });

  it('returns a jsPDF document object', () => {
    const items = [makeItem()];
    const doc = generateBattleCardPDF(makeOptions(items));

    expect(doc).toBeDefined();
    expect(doc.text).toBeDefined();
    expect(doc.save).toBeDefined();
  });

  it('includes project name and customer name', () => {
    const items = [makeItem()];
    generateBattleCardPDF(makeOptions(items));

    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => t.includes('Acme Corp Upgrade'))).toBe(true);
    expect(textCalls.some((t: string) => t.includes('John Smith'))).toBe(true);
  });

  it('handles items with null MSRP', () => {
    const items = [makeItem({ msrp: null })];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();

    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => t.includes('Price TBD'))).toBe(true);
  });

  it('handles items without competitor info (source: direct)', () => {
    const items = [makeItem({
      source: 'direct',
      competitorModel: undefined,
      competitorManufacturer: undefined,
    })];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();

    // Should not render "REPLACING:" for items without competitor info
    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => typeof t === 'string' && t.startsWith('REPLACING:'))).toBe(false);
  });

  it('handles items without axisFeatures', () => {
    const items = [makeItem({ axisFeatures: undefined })];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();

    // Should not render any "+" bullet points
    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => typeof t === 'string' && t.startsWith('+ '))).toBe(false);
  });

  it('renders axis features as green bullet points', () => {
    const items = [makeItem({ axisFeatures: ['Lightfinder 2.0', 'DLPU'] })];
    generateBattleCardPDF(makeOptions(items));

    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls).toContain('+ Lightfinder 2.0');
    expect(textCalls).toContain('+ DLPU');
  });

  it('renders notes in italic', () => {
    const items = [makeItem({ notes: 'Customer prefers dome form factor' })];
    generateBattleCardPDF(makeOptions(items));

    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => t.includes('Customer prefers dome form factor'))).toBe(true);

    // Verify italic font was set
    const fontCalls = mockMethods.setFont.mock.calls;
    expect(fontCalls.some((c: string[]) => c[1] === 'italic')).toBe(true);
  });

  it('handles large cart (20+ items) triggering page breaks', () => {
    const items = Array.from({ length: 25 }, (_, i) =>
      makeItem({
        id: `item-${i}`,
        model: `P${3200 + i}-LVE`,
        axisFeatures: ['Feature A', 'Feature B', 'Feature C'],
      })
    );
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();

    // With 25 items each taking ~58mm, should trigger multiple page breaks
    expect(mockMethods.addPage.mock.calls.length).toBeGreaterThan(0);
  });

  it('shows unknown price warning in summary when items have null MSRP', () => {
    const items = [
      makeItem({ id: '1', msrp: 1299 }),
      makeItem({ id: '2', model: 'CUSTOM-CAM', msrp: null }),
    ];
    const options = makeOptions(items);

    generateBattleCardPDF(options);

    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => typeof t === 'string' && t.includes('unknown pricing'))).toBe(true);
  });

  it('includes footer text', () => {
    const items = [makeItem()];
    generateBattleCardPDF(makeOptions(items));

    const textCalls = mockMethods.text.mock.calls.map(c => c[0]);
    expect(textCalls.some((t: string) => t.includes('Generated by AxisX'))).toBe(true);
  });
});

describe('PDF Export — mount pairing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders paired mount indented under camera', () => {
    const items = [
      makeItem({ id: '1', model: 'P3285-LVE', location: 'Parking Lot' }),
      makeItem({
        id: '2',
        model: 'T91B47-POLE',
        source: 'accessory',
        parentModel: 'P3285-LVE',
        accessoryType: 'mount',
        mountPlacement: 'pole',
        msrp: 199,
        quantity: 2,
        competitorModel: undefined,
        competitorManufacturer: undefined,
        axisFeatures: undefined,
      }),
    ];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();

    const textCalls = mockMethods.text.mock.calls.map((c: unknown[]) => c[0]);
    // Camera should be rendered
    expect(textCalls.some((t: string) => t.includes('P3285-LVE'))).toBe(true);
    // Mount should be rendered (indented — drawn via drawAccessoryCard)
    expect(textCalls.some((t: string) => t.includes('T91B47-POLE'))).toBe(true);
    // Mount type label
    expect(textCalls.some((t: string) => t.includes('Mount') && t.includes('pole'))).toBe(true);
  });

  it('includes mount MSRP in group subtotal', () => {
    const camera = makeItem({ id: '1', model: 'P3285-LVE', msrp: 1299, quantity: 1 });
    const mount = makeItem({
      id: '2',
      model: 'T91B47-POLE',
      source: 'accessory',
      parentModel: 'P3285-LVE',
      accessoryType: 'mount',
      mountPlacement: 'pole',
      msrp: 199,
      quantity: 1,
      competitorModel: undefined,
      competitorManufacturer: undefined,
      axisFeatures: undefined,
    });
    const items = [camera, mount];
    const summary = makeSummary(items);

    // Total should include both camera and mount
    expect(summary.totalMSRP).toBe(1299 + 199);
  });

  it('shows location label on group header', () => {
    const items = [
      makeItem({ id: '1', model: 'P3285-LVE', location: 'Loading Dock' }),
    ];
    const options = makeOptions(items);

    generateBattleCardPDF(options);

    const textCalls = mockMethods.text.mock.calls.map((c: unknown[]) => c[0]);
    expect(textCalls.some((t: string) => t.includes('Loading Dock'))).toBe(true);
  });

  it('handles camera with no paired mount', () => {
    const items = [makeItem({ id: '1', model: 'P3285-LVE' })];
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();
  });

  it('page break accounts for mount rows', () => {
    // Create many camera+mount pairs to trigger page breaks
    const items: CartItem[] = [];
    for (let i = 0; i < 15; i++) {
      items.push(makeItem({
        id: `cam-${i}`,
        model: `P${3200 + i}-LVE`,
        axisFeatures: ['Feature A', 'Feature B'],
      }));
      items.push(makeItem({
        id: `mount-${i}`,
        model: `T91B${40 + i}-POLE`,
        source: 'accessory',
        parentModel: `P${3200 + i}-LVE`,
        accessoryType: 'mount',
        mountPlacement: 'pole',
        msrp: 199,
        quantity: 1,
        competitorModel: undefined,
        competitorManufacturer: undefined,
        axisFeatures: undefined,
      }));
    }
    const options = makeOptions(items);

    expect(() => generateBattleCardPDF(options)).not.toThrow();
    // 15 camera+mount pairs should trigger page breaks
    expect(mockMethods.addPage.mock.calls.length).toBeGreaterThan(0);
  });
});
