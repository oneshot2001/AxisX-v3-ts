/**
 * AccessoryPanel Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessoryPanel } from '@/components/AccessoryPanel';
import type { AccessoryCompatEntry } from '@/types';

const mockAccessories: AccessoryCompatEntry[] = [
  {
    model: 'T91B47-POLE',
    displayName: 'AXIS T91B47 Pole Mount',
    description: 'For different pole diameters',
    accessoryType: 'mount',
    mountPlacement: 'pole',
    recommendation: 'recommended',
    requiresAdditional: false,
    msrpKey: 'T91B47-POLE',
  },
  {
    model: 'T91H61',
    displayName: 'AXIS T91H61 Wall Mount',
    description: 'Quick connection and room for more',
    accessoryType: 'mount',
    mountPlacement: 'wall',
    recommendation: 'recommended',
    requiresAdditional: true,
    msrpKey: 'T91H61',
  },
  {
    model: 'T8120',
    displayName: 'AXIS T8120 Midspan 15W 1-port',
    description: 'PoE midspan for single camera',
    accessoryType: 'power',
    recommendation: 'compatible',
    requiresAdditional: false,
    msrpKey: 'T8120',
  },
];

const defaultProps = {
  cameraModel: 'P3285-LVE',
  accessories: mockAccessories,
  onAddToCart: vi.fn(),
};

describe('AccessoryPanel', () => {
  it('renders accessory list for camera model', () => {
    render(<AccessoryPanel {...defaultProps} />);
    expect(screen.getByText('Accessories for AXIS P3285-LVE')).toBeTruthy();
    expect(screen.getByText('AXIS T91B47 Pole Mount')).toBeTruthy();
    expect(screen.getByText('AXIS T91H61 Wall Mount')).toBeTruthy();
    expect(screen.getByText('AXIS T8120 Midspan 15W 1-port')).toBeTruthy();
  });

  it('shows filter tabs', () => {
    render(<AccessoryPanel {...defaultProps} />);
    // Fluent UI Tab renders text twice (visible + reserved-space). Use value attribute.
    const tabs = screen.getAllByRole('tab');
    const tabValues = tabs.map((t) => t.getAttribute('value'));
    expect(tabValues).toContain('all');
    expect(tabValues).toContain('mount');
    expect(tabValues).toContain('power');
  });

  it('shows recommendation badge', () => {
    render(<AccessoryPanel {...defaultProps} />);
    // Two recommended accessories
    const badges = screen.getAllByText('Recommended');
    expect(badges.length).toBe(2);
  });

  it('shows "Requires additional" warning', () => {
    render(<AccessoryPanel {...defaultProps} />);
    expect(screen.getByText('Requires additional accessory')).toBeTruthy();
  });

  it('shows MSRP or "TBD"', () => {
    render(<AccessoryPanel {...defaultProps} />);
    // MSRP data may not have accessory models — should show "TBD"
    const tbds = screen.getAllByText('TBD');
    expect(tbds.length).toBeGreaterThan(0);
  });

  it('filters when type tab clicked', () => {
    render(<AccessoryPanel {...defaultProps} />);
    // Click Power tab using role
    const tabs = screen.getAllByRole('tab');
    const powerTab = tabs.find((t) => t.getAttribute('value') === 'power');
    expect(powerTab).toBeTruthy();
    fireEvent.click(powerTab!);
    // Should only show power accessory
    expect(screen.getByText('AXIS T8120 Midspan 15W 1-port')).toBeTruthy();
    expect(screen.queryByText('AXIS T91B47 Pole Mount')).toBeNull();
    expect(screen.queryByText('AXIS T91H61 Wall Mount')).toBeNull();
  });

  it('calls onAddToCart when clicked', () => {
    const onAddToCart = vi.fn();
    render(<AccessoryPanel {...defaultProps} onAddToCart={onAddToCart} />);
    // Click the first "Add" button
    const addButtons = screen.getAllByText('Add');
    fireEvent.click(addButtons[0]!);
    expect(onAddToCart).toHaveBeenCalledWith(mockAccessories[0]);
  });

  it('disables Add for items already in cart', () => {
    const cartModels = new Set(['T91B47-POLE']);
    render(
      <AccessoryPanel
        {...defaultProps}
        cartAccessoryModels={cartModels}
      />
    );
    // The pole mount should show "In BOM" (disabled)
    expect(screen.getByText('In BOM')).toBeTruthy();
    // Other items should show "Add"
    const addButtons = screen.getAllByText('Add');
    expect(addButtons.length).toBe(2); // wall mount + power
  });
});
