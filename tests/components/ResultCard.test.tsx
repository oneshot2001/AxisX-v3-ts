/**
 * ResultCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultCard } from '@/components/ResultCard';
import type { SearchResult, CompetitorMapping, LegacyAxisMapping } from '@/types';

describe('ResultCard', () => {
  const mockCompetitorMapping: CompetitorMapping = {
    competitor_model: 'DS-2CD2143G2-I',
    competitor_manufacturer: 'Hikvision',
    axis_replacement: 'P3265-LVE',
    match_confidence: 92,
    competitor_type: 'outdoor dome',
    competitor_resolution: '4MP',
    axis_features: ['Lightfinder 2.0', 'Forensic WDR', 'IR'],
    notes: 'NDAA-compliant replacement. Lightfinder approach over raw MP.',
  };

  const mockResult: SearchResult = {
    score: 92,
    type: 'exact',
    mapping: mockCompetitorMapping,
    isLegacy: false,
    axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
    category: 'ndaa',
  };

  const onAddToCart = vi.fn();

  beforeEach(() => {
    onAddToCart.mockClear();
  });

  describe('Basic rendering', () => {
    it('renders competitor model and manufacturer', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      expect(screen.getByText('DS-2CD2143G2-I')).toBeInTheDocument();
      expect(screen.getByText('Hikvision')).toBeInTheDocument();
    });

    it('renders Axis replacement model', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      expect(screen.getByText('P3265-LVE')).toBeInTheDocument();
      expect(screen.getByText('AXIS')).toBeInTheDocument();
    });

    it('renders View on Axis.com link with correct URL', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      const link = screen.getByRole('link', { name: /view on axis/i });
      expect(link).toHaveAttribute('href', 'https://www.axis.com/products/axis-p3265-lve');
    });

    it('calls onAddToCart when Add to BOM clicked', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      fireEvent.click(screen.getByRole('button', { name: /add to bom/i }));
      expect(onAddToCart).toHaveBeenCalledTimes(1);
      expect(onAddToCart).toHaveBeenCalledWith(1);
    });
  });

  describe('Spec comparison', () => {
    it('renders competitor specs (resolution and form factor)', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      // Resolution and form factor are combined: "4MP • outdoor dome"
      // Use getAllByText since 4MP may appear in multiple places
      expect(screen.getAllByText(/4MP/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/outdoor dome/i).length).toBeGreaterThan(0);
    });

    it('renders Axis features as pill badges', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      // Features now appear with "+" prefix in pill badges
      expect(screen.getByText(/\+ Lightfinder 2\.0/)).toBeInTheDocument();
      expect(screen.getByText(/\+ Forensic WDR/)).toBeInTheDocument();
    });

    it('handles missing competitor_resolution gracefully', () => {
      const mappingWithoutResolution: CompetitorMapping = {
        ...mockCompetitorMapping,
        competitor_resolution: undefined,
      };
      const resultWithoutResolution: SearchResult = {
        ...mockResult,
        mapping: mappingWithoutResolution,
      };

      render(<ResultCard result={resultWithoutResolution} onAddToCart={onAddToCart} />);

      // Should not crash, and should show placeholder (— text rendered separately in Fluent UI Text)
      // The text is now split across elements, so we check for the dash character
      expect(screen.getByText(/outdoor dome/)).toBeInTheDocument();
    });

    it('handles missing axis_features gracefully', () => {
      const mappingWithoutFeatures: CompetitorMapping = {
        ...mockCompetitorMapping,
        axis_features: undefined,
      };
      const resultWithoutFeatures: SearchResult = {
        ...mockResult,
        mapping: mappingWithoutFeatures,
      };

      render(<ResultCard result={resultWithoutFeatures} onAddToCart={onAddToCart} />);

      // Should not crash
      expect(screen.getByText('P3265-LVE')).toBeInTheDocument();
    });
  });

  describe('Notes section', () => {
    it('renders notes when present', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      expect(screen.getByText(/NDAA-compliant replacement/)).toBeInTheDocument();
      expect(screen.getByText(/Migration Note/)).toBeInTheDocument();
    });

    it('hides notes section when notes are missing', () => {
      const mappingWithoutNotes: CompetitorMapping = {
        ...mockCompetitorMapping,
        notes: undefined,
      };
      const resultWithoutNotes: SearchResult = {
        ...mockResult,
        mapping: mappingWithoutNotes,
      };

      render(<ResultCard result={resultWithoutNotes} onAddToCart={onAddToCart} />);

      // Migration Note label should not be present
      expect(screen.queryByText(/Migration Note/)).not.toBeInTheDocument();
    });
  });

  describe('Confidence badge', () => {
    it('renders HIGH badge for score >= 85', () => {
      render(<ResultCard result={mockResult} onAddToCart={onAddToCart} />);

      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('renders MEDIUM badge for score < 85', () => {
      const lowScoreResult: SearchResult = {
        ...mockResult,
        score: 75,
      };

      render(<ResultCard result={lowScoreResult} onAddToCart={onAddToCart} />);

      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });

  describe('Legacy mapping', () => {
    it('renders legacy Axis model correctly', () => {
      const legacyMapping: LegacyAxisMapping = {
        legacy_model: 'P3364-LVE',
        replacement_model: 'P3365-LVE',
        notes: 'Direct replacement for discontinued model.',
        discontinued_year: 2023,
      };
      const legacyResult: SearchResult = {
        score: 95,
        type: 'exact',
        mapping: legacyMapping,
        isLegacy: true,
        axisUrl: 'https://www.axis.com/products/axis-p3365-lve',
        category: 'legacy-axis',
      };

      render(<ResultCard result={legacyResult} onAddToCart={onAddToCart} />);

      expect(screen.getByText('P3364-LVE')).toBeInTheDocument();
      expect(screen.getByText('P3365-LVE')).toBeInTheDocument();
      expect(screen.getByText(/Axis \(Legacy\)/)).toBeInTheDocument();
    });
  });
});
