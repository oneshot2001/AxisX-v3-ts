import { describe, it, expect } from 'vitest';
import { detectColumnMapping, extractData } from '@/core/spreadsheet';
import type { SpreadsheetColumnMapping } from '@/types';

describe('useSpreadsheetImport — mount type support', () => {
  describe('detectColumnMapping', () => {
    it('detects mount type column from headers', () => {
      const headers = ['Model', 'Qty', 'Mount Type', 'Location'];
      const mapping = detectColumnMapping(headers);
      expect(mapping.mountTypeColumn).toBe(2);
    });

    it('detects location column from headers', () => {
      const headers = ['Model', 'Qty', 'Mount Type', 'Location'];
      const mapping = detectColumnMapping(headers);
      expect(mapping.locationColumn).toBe(3);
    });

    it('detects "mounting" as mount type column', () => {
      const headers = ['Camera', 'Mounting', 'Area'];
      const mapping = detectColumnMapping(headers);
      expect(mapping.mountTypeColumn).toBe(1);
    });

    it('detects "zone" as location column', () => {
      const headers = ['Model', 'Zone'];
      const mapping = detectColumnMapping(headers);
      expect(mapping.locationColumn).toBe(1);
    });

    it('returns undefined mountTypeColumn when no mount header', () => {
      const headers = ['Model', 'Qty', 'Manufacturer'];
      const mapping = detectColumnMapping(headers);
      expect(mapping.mountTypeColumn).toBeUndefined();
    });

    it('returns undefined locationColumn when no location header', () => {
      const headers = ['Model', 'Qty'];
      const mapping = detectColumnMapping(headers);
      expect(mapping.locationColumn).toBeUndefined();
    });
  });

  describe('extractData', () => {
    const rows = [
      ['DS-2CD2143G2-I', '12', 'Pole', 'Parking Lot'],
      ['XND-6080RV', '45', 'Ceiling Recessed', 'Hallways'],
      ['XNO-6120R', '8', '', 'Loading Dock'],
      ['QNV-7080R', '35', 'Pendant', ''],
    ];

    const mappingWithMount: SpreadsheetColumnMapping = {
      modelColumn: 0,
      quantityColumn: 1,
      mountTypeColumn: 2,
      locationColumn: 3,
    };

    it('parses mount type column', () => {
      const extracted = extractData(rows, mappingWithMount);
      expect(extracted[0]!.mountType).toBe('Pole');
      expect(extracted[1]!.mountType).toBe('Ceiling Recessed');
    });

    it('passes location through to extracted rows', () => {
      const extracted = extractData(rows, mappingWithMount);
      expect(extracted[0]!.location).toBe('Parking Lot');
      expect(extracted[1]!.location).toBe('Hallways');
    });

    it('handles empty mount type cells (returns undefined)', () => {
      const extracted = extractData(rows, mappingWithMount);
      expect(extracted[2]!.mountType).toBeUndefined();
    });

    it('handles empty location cells (returns undefined)', () => {
      const extracted = extractData(rows, mappingWithMount);
      expect(extracted[3]!.location).toBeUndefined();
    });

    it('handles missing mount type column gracefully', () => {
      const mappingNoMount: SpreadsheetColumnMapping = {
        modelColumn: 0,
        quantityColumn: 1,
      };
      const extracted = extractData(rows, mappingNoMount);
      expect(extracted[0]!.mountType).toBeUndefined();
      expect(extracted[0]!.location).toBeUndefined();
    });

    it('handles mixed: some rows with mount type, some without', () => {
      const extracted = extractData(rows, mappingWithMount);
      expect(extracted).toHaveLength(4);
      // Row with mount type
      expect(extracted[0]!.mountType).toBe('Pole');
      // Row without mount type
      expect(extracted[2]!.mountType).toBeUndefined();
      // Row with mount type but no location
      expect(extracted[3]!.mountType).toBe('Pendant');
      expect(extracted[3]!.location).toBeUndefined();
    });
  });
});
