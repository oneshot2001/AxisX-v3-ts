import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      offset={20}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group rounded-xl border border-hairline bg-surface text-ink shadow-lg backdrop-blur-md',
          title: 'font-medium tracking-tight',
          description: 'text-ink-muted text-[12px]',
          actionButton:
            'bg-axis-yellow text-ink rounded-md px-2.5 py-1 text-[12px] font-medium',
          cancelButton:
            'bg-secondary text-ink-muted rounded-md px-2.5 py-1 text-[12px]',
          success: 'border-axis-yellow/30 bg-surface',
          error: 'border-danger/30 bg-surface',
        },
      }}
    />
  </React.StrictMode>
);
