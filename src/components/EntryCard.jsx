import React from 'react';
import Link from './Link.jsx';
export default function EntryCard({ entry, compact = false }) {
  return <Link className={`entry-card ${compact ? 'compact' : ''}`} href={`/entry/${entry.id}`}>
    <div className="card-meta"><span>{entry.category}</span><span>↗</span></div>
    <h3>{entry.title}</h3><p>{entry.summary}</p>
    {!compact && <div className="card-bottom"><span className="tag">{entry.tags[0] || 'reference'}</span><time dateTime={entry.created}>{entry.created}</time></div>}
    {entry.matches?.length > 0 && <div className="match">Matched in {entry.matches.join(', ').toLowerCase()}</div>}
  </Link>;
}
