import React from "react";
import Link from "./Link.jsx";
import { entryHref, libraryHref } from "../data/knowledgeRepository.js";

export default function EntryCard({
  entry,
  compact = false,
  toggle,
  bookmarked,
}) {
  return (
    <article className={`entry-card ${compact ? "compact" : ""}`}>
      <div className="entry-row-heading">
        <div className="card-meta">
          <Link href={libraryHref({ category: entry.category })}>
            {entry.category}
          </Link>
          {entry.subcategory && <span> / {entry.subcategory}</span>}
        </div>
        <div className="row-actions">
          <span className={`status-badge status-${entry.status}`}>
            {entry.error ? "File error" : entry.status}
          </span>
          {toggle && (
            <button
              className="bookmark-icon"
              aria-label={`${bookmarked ? "Remove bookmark for" : "Bookmark"} ${entry.title}`}
              aria-pressed={bookmarked}
              onClick={() => toggle(entry.id)}
            >
              {bookmarked ? "★" : "☆"}
            </button>
          )}
        </div>
      </div>
      <h3>
        <Link href={entryHref(entry)}>{entry.title}</Link>
      </h3>
      {entry.summary && <p>{entry.summary}</p>}
      <div className="card-bottom">
        <div className="tags">
          {entry.tags.map((tag) => (
            <Link className="tag" key={tag} href={libraryHref({ tag })}>
              {tag}
            </Link>
          ))}
        </div>
        <span className="entry-date">
          Updated{" "}
          {entry.updated ? (
            <time dateTime={entry.updated}>{entry.updated}</time>
          ) : (
            "not recorded"
          )}
        </span>
      </div>
      {entry.matches?.length > 0 && (
        <div className="match">Matched in {entry.matches.join(", ")}</div>
      )}
    </article>
  );
}
