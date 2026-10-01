import { loadEntries } from '../utils/knowledge.js';

const files = import.meta.glob('../../knowledge/**/*.md', { query: '?raw', import: 'default', eager: true });
export const entries = loadEntries(files, message => { if (import.meta.env.DEV) console.warn(`[knowledge] ${message}`); });
