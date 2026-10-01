import React from 'react';
import ReactMarkdown from 'react-markdown';
import { entries } from '../data/entries.js';
import { relatedEntries, slugify } from '../utils/knowledge.js';
import Link from '../components/Link.jsx';
import EntryCard from '../components/EntryCard.jsx';

export default function Entry({ entry }) {
  const related = relatedEntries(entries, entry);
  return <article className="page detail-page"><Link className="back-link" href={`/category/${slugify(entry.category)}`}>← Back to {entry.category}</Link><div className="eyebrow">KNOWLEDGE ENTRY / {entry.category.toUpperCase()}</div><h1>{entry.title}</h1><div className="entry-meta"><Link href={`/category/${slugify(entry.category)}`}>{entry.category}</Link><span>Added <time dateTime={entry.created}>{entry.created}</time></span><span>{Math.max(1, Math.ceil(entry.body.split(/\s+/).length / 200))} min read</span></div><p className="entry-summary">{entry.summary}</p><div className="tags">{entry.tags.map(tag => <Link className="tag" key={tag} href={`/library?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</div><div className="markdown"><ReactMarkdown components={{ a: ({ href, children }) => href?.startsWith('/') ? <Link href={href}>{children}</Link> : <a href={href} rel="noreferrer">{children}</a> }}>{entry.body}</ReactMarkdown></div><section className="related"><div className="section-heading"><h2>Related entries</h2><span>CONNECTED BY SHARED TAGS</span></div>{related.length ? <div className="entries-grid">{related.map(item => <EntryCard compact key={item.id} entry={item} />)}</div> : <p className="muted">No related entries yet. Shared tags connect notes as your library grows.</p>}</section></article>;
}
