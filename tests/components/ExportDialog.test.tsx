/**
 * ExportDialog Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportDialog } from '@/components/ExportDialog';

describe('ExportDialog', () => {
  const onClose = vi.fn();
  const onGenerate = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    onGenerate.mockClear();
  });

  it('renders dialog when open', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    expect(screen.getByText(/export battle card pdf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <ExportDialog
        open={false}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    expect(screen.queryByText(/export battle card pdf/i)).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close (X) button is clicked', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onGenerate with project and customer name', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    const projectInput = screen.getByLabelText(/project name/i);
    const customerInput = screen.getByLabelText(/customer name/i);

    fireEvent.change(projectInput, { target: { value: 'Acme Corp Upgrade' } });
    fireEvent.change(customerInput, { target: { value: 'John Smith' } });
    fireEvent.click(screen.getByRole('button', { name: /generate pdf/i }));

    expect(onGenerate).toHaveBeenCalledWith({
      projectName: 'Acme Corp Upgrade',
      customerName: 'John Smith',
    });
  });

  it('trims whitespace from inputs', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    const projectInput = screen.getByLabelText(/project name/i);
    const customerInput = screen.getByLabelText(/customer name/i);

    fireEvent.change(projectInput, { target: { value: '  Acme Corp  ' } });
    fireEvent.change(customerInput, { target: { value: '  Jane Doe  ' } });
    fireEvent.click(screen.getByRole('button', { name: /generate pdf/i }));

    expect(onGenerate).toHaveBeenCalledWith({
      projectName: 'Acme Corp',
      customerName: 'Jane Doe',
    });
  });

  it('allows generating with empty fields', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /generate pdf/i }));

    expect(onGenerate).toHaveBeenCalledWith({
      projectName: '',
      customerName: '',
    });
  });

  it('disables Generate button when isGenerating is true', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
        isGenerating={true}
      />
    );

    const generateBtn = screen.getByRole('button', { name: /generating/i });
    expect(generateBtn).toBeDisabled();
  });

  it('shows "Generating..." text when isGenerating is true', () => {
    render(
      <ExportDialog
        open={true}
        onClose={onClose}
        onGenerate={onGenerate}
        isGenerating={true}
      />
    );

    expect(screen.getByText(/generating\.\.\./i)).toBeInTheDocument();
  });
});
