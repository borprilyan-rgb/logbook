import { useEffect, useRef, useState } from 'react';
import { readPersonal, recordView, savePersonal, toggleBookmark } from '../utils/personal.js';

function storage() { try { return window.localStorage; } catch { return null; } }
export default function usePersonal(entries, currentEntry) {
  const [personal, setPersonal] = useState(() => readPersonal(storage(), entries));
  const [storageFailed, setStorageFailed] = useState(false);
  const lastEntry = useRef(null);
  useEffect(() => {
    if (!currentEntry || currentEntry.error) { lastEntry.current = null; return; }
    if (lastEntry.current === currentEntry.id) return;
    lastEntry.current = currentEntry.id;
    setPersonal(state => recordView(state, currentEntry.id));
  }, [currentEntry?.id]);
  useEffect(() => { setStorageFailed(!savePersonal(storage(), personal)); }, [personal]);
  useEffect(() => {
    const sync = event => { if (event.key === null || event.key === 'fieldnotes.personal.v1') setPersonal(readPersonal(storage(), entries)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [entries]);
  return { personal, storageFailed, toggle: id => setPersonal(state => toggleBookmark(state, id)) };
}
