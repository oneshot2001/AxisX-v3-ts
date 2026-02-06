/**
 * ExportDialog Component
 *
 * Fluent UI dialog that prompts for project name and customer name
 * before generating a Battle Card PDF.
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Label,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DocumentPdf24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import type { ExportMetadata } from '@/types';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
  },
  generateButton: {
    backgroundColor: axisTokens.primary,
    color: '#000',
    ':hover': {
      backgroundColor: axisTokens.primaryDark,
    },
  },
});

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
  const styles = useStyles();
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
      onOpenChange={(_event, data) => {
        if (!data.open) handleClose();
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={handleClose}
              />
            }
          >
            <DocumentPdf24Regular style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Export Battle Card PDF
          </DialogTitle>

          <DialogContent className={styles.content}>
            <div className={styles.field}>
              <Label className={styles.label} htmlFor="export-project-name">
                Project Name
              </Label>
              <Input
                id="export-project-name"
                placeholder="e.g., Acme Corp Camera Upgrade"
                value={projectName}
                onChange={(_e, data) => setProjectName(data.value)}
              />
            </div>

            <div className={styles.field}>
              <Label className={styles.label} htmlFor="export-customer-name">
                Customer Name
              </Label>
              <Input
                id="export-customer-name"
                placeholder="e.g., John Smith"
                value={customerName}
                onChange={(_e, data) => setCustomerName(data.value)}
              />
            </div>
          </DialogContent>

          <DialogActions>
            <Button
              appearance="secondary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating}
              icon={<DocumentPdf24Regular />}
            >
              {isGenerating ? 'Generating...' : 'Generate PDF'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
