import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@arcgis/core/assets/esri/themes/dark/main.css';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
