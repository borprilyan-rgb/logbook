import React, { useEffect, useState } from 'react';
import { entries } from './data/entries.js';
import { categoryNames, slugify } from './utils/knowledge.js';
import Link from './components/Link.jsx';
import Library from './pages/Library.jsx';
import Entry from './pages/Entry.jsx';

export default function App() {
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const update = () => { setLocation(window.location.pathname + window.location.search); setMenuOpen(false); }; window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
  const url = new URL(location, window.location.origin);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const category = categoryNames.find(name => path === `/category/${slugify(name)}`);
  const entry = entries.find(item => path === `/entry/${item.id}`);
  const validLibrary = path === '/' || path === '/library' || !!category;
  useEffect(() => { document.title = `${entry?.title || category || (path === '/library' ? 'All entries' : 'Fieldnotes')} — QS knowledge base`; }, [path, entry, category]);
  return <div className="app-shell">
    <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="sidebar" onClick={() => setMenuOpen(!menuOpen)}>☰ <span>Fieldnotes</span></button>
    <aside id="sidebar" className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <Link href="/" className="brand"><span className="brand-mark">f.</span><span>fieldnotes<span className="brand-sub">QS KNOWLEDGE BASE</span></span></Link>
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav aria-label="Main navigation"><Link href="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>⌂ <span>Overview</span></Link><Link href="/library" className={`nav-item ${path === '/library' ? 'active' : ''}`}>▤ <span>All entries</span><small>{entries.length}</small></Link></nav>
      <div className="workspace-label category-label">CATEGORIES</div>
      <nav aria-label="Categories">{categoryNames.map((name, index) => <Link key={name} href={`/category/${slugify(name)}`} className={`nav-item ${category === name ? 'active' : ''}`}><span className={`category-dot dot-${index}`} /><span>{name}</span><small>{entries.filter(item => item.category === name).length}</small></Link>)}</nav>
      <div className="sidebar-note"><span className="status-dot" /> A growing reference library<p>Learn it. Document it.<br />Find it when you need it.</p></div>
      <div className="sidebar-footer">LOCAL MARKDOWN LIBRARY <span>↗</span></div>
    </aside>
    <div className="main-shell"><header className="topbar"><span>Workspace <span className="slash">/</span> {entry ? entry.category : category || (path === '/library' ? 'All entries' : 'Overview')}</span><span className="topbar-right"><span className="status-dot" /> Personal reference <span className="avatar">QS</span></span></header>
      <main>{entry ? <Entry entry={entry} /> : validLibrary ? <Library category={category} home={path === '/'} initialQuery={url.searchParams.get('q') || ''} /> : <div className="empty"><h1>Page not found</h1><p>This reference may have moved.</p><Link href="/library">Browse all entries →</Link></div>}</main>
      <footer className="main-footer"><span>FIELDNOTES / QUANTITY SURVEYING</span><span>Knowledge that builds over time.</span></footer>
    </div>
  </div>;
}
