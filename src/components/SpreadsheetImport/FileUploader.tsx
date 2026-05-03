/**
 * FileUploader — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer
 * Motion + lucide-react).
 *
 * Layout:
 *   [dropzone]  Large dashed drop zone. Default = `border-hairline` on
 *               `bg-surface-2`. Drag-active = axis-yellow border + soft
 *               yellow tint. Click-to-browse via hidden input.
 *   [file list] Recently-selected files appear as line items beneath the
 *               dropzone with filename + human-readable size + lucide X
 *               remove. Removing a row from the local list is purely visual
 *               — the file's already been handed to the parent — but mirrors
 *               the multi-file UX feel without changing the public API.
 *   [error]     Inline danger pill if the parent reports a parse error.
 */

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface FileUploaderProps {
  /** Callback when file is selected */
  onFileSelect: (file: File) => void;
  /** Whether upload is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

interface RecentFile {
  id: string;
  name: string;
  size: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FileUploader({
  onFileSelect,
  isLoading = false,
  error,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [recentFiles, setRecentFiles] = useState<readonly RecentFile[]>([]);

  const handleFile = useCallback(
    (file: File) => {
      const id = `${file.name}-${file.size}-${Date.now()}`;
      setRecentFiles((prev) => [{ id, name: file.name, size: file.size }, ...prev].slice(0, 5));
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
      // Reset native input so the same file can be re-selected.
      e.target.value = '';
    },
    [handleFile]
  );

  const removeRecent = useCallback((id: string) => {
    setRecentFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div data-swift className="flex flex-col gap-4">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload spreadsheet file"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-center gap-3',
          'rounded-xl border-2 border-dashed border-hairline bg-surface-2 p-10 text-center',
          'transition-colors duration-150 ease-out',
          'hover:border-[oklch(0.86_0_0)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          isDragActive && 'border-axis-yellow bg-axis-yellow-soft'
        )}
      >
        <motion.div
          animate={{
            scale: isDragActive ? 1.05 : 1,
            color: isDragActive
              ? 'var(--color-axis-yellow-ink)'
              : 'var(--color-ink-faint)',
          }}
          transition={{ type: 'spring', stiffness: 480, damping: 32 }}
          className="flex size-12 items-center justify-center"
        >
          <UploadCloud className="size-10" strokeWidth={1.5} />
        </motion.div>

        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-semibold text-ink">
            {isDragActive ? 'Drop file here' : 'Drag & drop a spreadsheet'}
          </p>
          <p className="text-[12px] text-ink-muted">or click to browse</p>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={isLoading}
          onClick={(e) => {
            // Prevent the parent dropzone click from firing twice.
            e.stopPropagation();
            handleClick();
          }}
          className="h-8 gap-1.5 bg-axis-yellow text-ink shadow-sm hover:brightness-105 active:brightness-95"
        >
          {isLoading ? 'Processing…' : 'Select File'}
        </Button>

        <div className="mt-1 flex gap-1.5">
          {(['.csv', '.xlsx', '.xls'] as const).map((ext) => (
            <span
              key={ext}
              className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-faint shadow-[0_0_0_1px_oklch(0_0_0/0.04)]"
            >
              {ext}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Recent files */}
      <AnimatePresence initial={false}>
        {recentFiles.length > 0 && (
          <motion.ul
            key="recent-files"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="flex flex-col gap-1.5 overflow-hidden"
          >
            {recentFiles.map((file) => (
              <motion.li
                key={file.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                className={cn(
                  'flex items-center gap-3 rounded-md border border-hairline bg-surface px-3 py-2',
                  'shadow-sm'
                )}
              >
                <FileSpreadsheet
                  className="size-4 shrink-0 text-axis-yellow-ink"
                  strokeWidth={1.75}
                />
                <span className="flex-1 truncate text-[13px] font-medium text-ink">
                  {file.name}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                  {formatBytes(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeRecent(file.id)}
                  aria-label={`Remove ${file.name} from recent files`}
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-ink-faint',
                    'transition-colors hover:bg-secondary hover:text-ink'
                  )}
                >
                  <X className="size-3.5" />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Error pill */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 480, damping: 36 }}
            role="alert"
            className={cn(
              'flex items-start gap-2 rounded-md border border-danger/20 bg-danger/8 px-3 py-2',
              'text-[13px] text-danger'
            )}
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
