import React from "react";
import {
  knowledgeRepository as repository,
  libraryHref,
} from "../data/knowledgeRepository.js";
import { slugify } from "../utils/knowledge.js";
import Link from "../components/Link.jsx";
import EntryList from "../components/EntryList.jsx";
import Markdown from "../components/Markdown.jsx";

export default function Entry({ entry, personal, toggle }) {
  const all = repository.getAllEntries();
  const related = repository.getRelatedEntries(entry);
  const category = all
    .filter(
      (other) =>
        other.id !== entry.id &&
        other.category === entry.category &&
        !other.error,
    )
    .slice(0, 4);
  const project = all
    .filter(
      (other) =>
        other.id !== entry.id &&
        other.projectRelated.some((name) =>
          entry.projectRelated.includes(name),
        ) &&
        !other.error,
    )
    .slice(0, 4);
  function section(title, items, empty) {
    return (
      <section className="related">
        <div className="section-heading">
          <h2>{title}</h2>
        </div>
        <EntryList
          entries={items}
          toggle={toggle}
          bookmarks={personal.bookmarks}
          empty={empty}
        />
      </section>
    );
  }
  return (
    <article className="page detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/library">Library</Link>
        <span>›</span>
        <Link href={`/category/${slugify(entry.category)}`}>
          {entry.category}
        </Link>
        {entry.subcategory && (
          <>
            <span>›</span>
            <Link
              href={libraryHref({
                category: entry.category,
                subcategory: entry.subcategory,
              })}
            >
              {entry.subcategory}
            </Link>
          </>
        )}
        <span>›</span>
        <span aria-current="page">{entry.title}</span>
      </nav>
      <div className="entry-title-row">
        <h1>{entry.title}</h1>
        <button
          aria-pressed={personal.bookmarks.includes(entry.id)}
          onClick={() => toggle(entry.id)}
        >
          {personal.bookmarks.includes(entry.id)
            ? "★ Bookmarked"
            : "☆ Bookmark"}
        </button>
      </div>
      {entry.summary && <p className="entry-summary">{entry.summary}</p>}
      <dl className="metadata-grid">
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`status-badge status-${entry.status}`}>
              {entry.status}
            </span>
          </dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{entry.difficulty}</dd>
        </div>
        <div>
          <dt>Importance</dt>
          <dd>{entry.importance}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{entry.created || "Not recorded"}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{entry.updated || "Not recorded"}</dd>
        </div>
        <div>
          <dt>Source type</dt>
          <dd>{entry.sourceType || "Not recorded"}</dd>
        </div>
        {entry.projectRelated.length > 0 && (
          <div className="metadata-wide">
            <dt>Projects</dt>
            <dd>
              {entry.projectRelated.map((name) => (
                <Link key={name} href={libraryHref({ project: name })}>
                  {name}
                </Link>
              ))}
            </dd>
          </div>
        )}
        {entry.standards.length > 0 && (
          <div className="metadata-wide">
            <dt>Standards</dt>
            <dd>
              {entry.standards.map((name) => (
                <Link key={name} href={libraryHref({ q: name })}>
                  {name}
                </Link>
              ))}
            </dd>
          </div>
        )}
        {entry.aliases.length > 0 && (
          <div className="metadata-wide">
            <dt>Also known as</dt>
            <dd>{entry.aliases.join(" · ")}</dd>
          </div>
        )}
      </dl>
      <div className="tags">
        {entry.tags.map((tag) => (
          <Link className="tag" key={tag} href={libraryHref({ tag })}>
            #{tag}
          </Link>
        ))}
      </div>
      <details className="source-details">
        <summary>
          Source file: <code>{entry.sourceFile}</code>
        </summary>
        <p>
          Edit this Markdown file in the repository. Git records the actual
          version history.
        </p>
        {entry.warnings.length > 0 && (
          <ul>
            {entry.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </details>
      {entry.error ? (
        <div className="entry-error" role="alert">
          <h2>This note could not be loaded</h2>
          <p>{entry.error}</p>
          <p>
            Correct the source file's YAML frontmatter to restore the entry.
          </p>
        </div>
      ) : (
        <Markdown key={entry.id} body={entry.body} />
      )}
      <section className="related">
        <div className="section-heading">
          <h2>Related Topics</h2>
          <Link href="/topics">All topics →</Link>
        </div>
        <div className="tags">
          {entry.tags.map((tag) => (
            <Link key={tag} className="tag" href={libraryHref({ tag })}>
              {tag}
            </Link>
          ))}
        </div>
        {!entry.tags.length && <p className="muted">No topic tags yet.</p>}
      </section>
      {section(
        "Related Entries",
        related,
        "No connected entries yet. Shared metadata connects notes as the library grows.",
      )}
      {section("Same Category", category, "No other entries in this category.")}
      {section(
        "Same Project",
        project,
        entry.projectRelated.length
          ? "No other entries are associated with this project."
          : "This is a general reference note with no project association.",
      )}
    </article>
  );
}
