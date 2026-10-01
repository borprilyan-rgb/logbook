import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

test('home, entry, category, search, and missing routes render', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  const previousWindow = globalThis.window;
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx');
    for (const [pathname, search, expected] of [
      ['/', '', 'A little knowledge. A stronger foundation.'],
      ['/entry/concrete/slump', '', 'Quick Answer'],
      ['/category/contract', '', 'Contract entries'],
      ['/library', '?q=hydration', 'Matched in'],
      ['/category/materials', '', 'Room for new knowledge'],
      ['/missing', '', 'Page not found'],
    ]) {
      globalThis.window = { location: { pathname, search, origin: 'http://localhost' } };
      const html = renderToString(React.createElement(App));
      assert.ok(html.includes(expected), `${pathname}${search} should include ${expected}`);
    }
  } finally {
    globalThis.window = previousWindow;
    await server.close();
  }
});
