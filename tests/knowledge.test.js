import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseEntry, searchEntries, relatedEntries } from '../src/utils/knowledge.js';

function load(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const file = path.join(dir, item.name);
    return item.isDirectory() ? load(file) : item.name.endsWith('.md') ? [parseEntry(fs.readFileSync(file, 'utf8'), '/' + file.replaceAll('\\', '/'))] : [];
  });
}
const entries = load('knowledge');
test('repository notes have valid metadata, distinct IDs, and working internal links', () => {
  assert.ok(entries.length > 0);
  assert.equal(new Set(entries.map(item => item.id)).size, entries.length);
  for (const entry of entries) for (const match of entry.body.matchAll(/\]\(\/entry\/([^)]*)\)/g)) assert.ok(entries.some(item => item.id === match[1]), `Broken link: ${match[1]}`);
});
test('search finds body text, combines terms, and respects category filters', () => {
  assert.ok(searchEntries(entries, 'CEMENT HYDRATION').some(item => item.title === 'Concrete Curing' && item.matches.includes('Content')));
  assert.equal(searchEntries(entries, 'k350')[0].title, 'Concrete K Grade');
  assert.equal(searchEntries(entries, 'slump', 'Contract').length, 0);
  assert.equal(searchEntries(entries, 'no-such-term').length, 0);
});
test('related entries share tags and exclude the current entry', () => {
  const entry = entries.find(item => item.title === 'Final Account');
  const related = relatedEntries(entries, entry);
  assert.ok(related.some(item => item.title === 'BOQ'));
  assert.ok(related.every(item => item.id !== entry.id && item.shared > 0));
});
test('invalid frontmatter reports the file', () => {
  assert.throws(() => parseEntry('No frontmatter', 'bad.md'), /bad.md/);
});
