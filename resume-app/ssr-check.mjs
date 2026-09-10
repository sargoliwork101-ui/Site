/* SSR smoke test: executes the app's render path to surface runtime errors */
import { createServer } from 'vite';

// Minimal browser globals
global.window = global;
global.document = {
  documentElement: { lang: 'fa', dir: 'rtl', style: {} },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ style: {} }),
  body: { appendChild: () => {} },
};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
Object.defineProperty(global, 'navigator', { value: { userAgent: 'node', clipboard: { writeText: async () => {} } }, configurable: true });
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.location = { hash: '' };

const server = await createServer({
  root: '/home/user/Site/resume-app',
  server: { middlewareMode: true },
  logLevel: 'error',
});

const ROUTES = {
  '': ['site-header', 'hf-title', 'stats-bar', 'cta-band', 'site-footer'],
  '#/about': ['about-grid', 'profile-card', 'timeline', 'skill-cat'],
  '#/works': ['page-hero', 'filters', 'cards-grid'],
  '#/papers': ['paper-tools', 'search-input', 'year-head'],
  '#/contact': ['contact-grid', 'contact-form-card'],
};

try {
  const React = (await import('react')).default;
  const { renderToString } = await import('react-dom/server');
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');

  for (const [hash, checks] of Object.entries(ROUTES)) {
    global.location = { hash };
    const html = renderToString(React.createElement(App));
    const missing = checks.filter((c) => !html.includes(c));
    console.log(`ROUTE ${hash || '(home)'}: length=${html.length} ${missing.length ? 'MISSING: ' + missing.join(',') : 'ALL CHECKS FOUND'}`);
  }
} catch (err) {
  console.error('RENDER FAILED:');
  console.error(err);
  process.exitCode = 1;
} finally {
  await server.close();
}
