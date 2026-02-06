/**
 * AxisX v3 - Application Entry Point
 *
 * Wraps the app in FluentProvider with Axis Communications branding.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { axisLightTheme } from './styles/fluentTheme';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={axisLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>
);
