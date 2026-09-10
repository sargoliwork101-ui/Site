import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Self-hosted Persian & mono fonts (bundled locally — no CDN needed, works on any host).
// Only the subsets this site needs are imported to keep the build small:
// Vazirmatn (default UI font): arabic subset = Persian glyphs, latin subset = English UI.
import '@fontsource/vazirmatn/arabic-400.css';
import '@fontsource/vazirmatn/latin-400.css';
import '@fontsource/vazirmatn/arabic-500.css';
import '@fontsource/vazirmatn/latin-500.css';
import '@fontsource/vazirmatn/arabic-600.css';
import '@fontsource/vazirmatn/latin-600.css';
import '@fontsource/vazirmatn/arabic-700.css';
import '@fontsource/vazirmatn/latin-700.css';
import '@fontsource/vazirmatn/arabic-800.css';
import '@fontsource/vazirmatn/latin-800.css';
import '@fontsource/vazirmatn/arabic-900.css';
import '@fontsource/vazirmatn/latin-900.css';
// Fira Code: used by engineering/mono templates (latin + latin-ext only).
import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-ext-400.css';
import '@fontsource/fira-code/latin-500.css';
import '@fontsource/fira-code/latin-ext-500.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/fira-code/latin-ext-700.css';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
