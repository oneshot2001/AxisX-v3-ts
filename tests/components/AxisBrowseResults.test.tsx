/**
 * AxisBrowseResults Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AxisBrowseResults } from '@/components/AxisBrowseResults';
import { AXIS_CATALOG, getCatalogModelCount } from '@/data/axisCatalog';

describe('AxisBrowseResults', () => {
  const onAddToCart = vi.fn();

  beforeEach(() => {
    onAddToCart.mockClear();
  });

  describe('Header', () => {
    it('renders portfolio header with model count', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      expect(screen.getByText('Axis Communications Portfolio')).toBeInTheDocument();
      expect(screen.getByText(`${getCatalogModelCount()} models`)).toBeInTheDocument();
    });
  });

  describe('Category rendering', () => {
    it('renders all category headers', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      for (const category of AXIS_CATALOG) {
        expect(screen.getByText(category.label)).toBeInTheDocument();
      }
    });

    it('renders category descriptions', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      for (const category of AXIS_CATALOG) {
        expect(screen.getByText(category.description)).toBeInTheDocument();
      }
    });
  });

  describe('Series rendering', () => {
    it('renders series labels within categories', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      // Check a few known series labels
      expect(screen.getByText('M30 Series')).toBeInTheDocument();
      expect(screen.getByText('P32 Series')).toBeInTheDocument();
      expect(screen.getByText('Q60 Series')).toBeInTheDocument();
    });

    it('renders series descriptions', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      expect(screen.getByText('Affordable mini domes')).toBeInTheDocument();
      expect(screen.getByText('Versatile AI-powered domes (ARTPEC-8/9)')).toBeInTheDocument();
    });
  });

  describe('Model rendering', () => {
    it('renders individual model names', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      // Check specific models
      expect(screen.getByText('M3085-V')).toBeInTheDocument();
      expect(screen.getByText('P3275-LVE')).toBeInTheDocument();
      expect(screen.getByText('Q6135-LE')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('"View on Axis.com" links have correct href format', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      // Find links for a known model
      const axisLinks = screen.getAllByText('Axis.com');
      expect(axisLinks.length).toBeGreaterThan(0);

      // Check that they're actual links with correct href pattern
      const firstLink = axisLinks[0].closest('a');
      expect(firstLink).toHaveAttribute('href');
      expect(firstLink?.getAttribute('href')).toMatch(
        /^https:\/\/www\.axis\.com\/products\/axis-/
      );
    });
  });

  describe('Add to BOM', () => {
    it('"Add to BOM" button calls onAddToCart with model and quantity', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      const addButtons = screen.getAllByText('Add to BOM');
      expect(addButtons.length).toBeGreaterThan(0);

      fireEvent.click(addButtons[0]);

      expect(onAddToCart).toHaveBeenCalledTimes(1);
      expect(onAddToCart).toHaveBeenCalledWith(expect.any(String), 1);
    });
  });

  describe('Accordion state', () => {
    it('all categories are expanded by default', () => {
      render(<AxisBrowseResults onAddToCart={onAddToCart} />);

      // If all expanded, series labels from every category should be visible
      // Check at least one series from each category type
      expect(screen.getByText('M30 Series')).toBeInTheDocument(); // Dome
      expect(screen.getByText('M20 Series')).toBeInTheDocument(); // Bullet
      expect(screen.getByText('M10 Series')).toBeInTheDocument(); // Box
      expect(screen.getByText('M50 Series')).toBeInTheDocument(); // PTZ
      expect(screen.getByText('P37 Series')).toBeInTheDocument(); // Panoramic
    });
  });
});
