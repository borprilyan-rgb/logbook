import React from "react";
import EntryCard from "./EntryCard.jsx";

export default function EntryList({
  entries,
  empty = "No knowledge entries found.",
  compact = true,
  toggle,
  bookmarks = [],
}) {
  return entries.length ? (
    <div className={compact ? "entry-list" : "entries-grid"}>
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          compact={compact}
          toggle={toggle}
          bookmarked={bookmarks.includes(entry.id)}
        />
      ))}
    </div>
  ) : (
    <div className="empty">
      <p>{empty}</p>
    </div>
  );
}
