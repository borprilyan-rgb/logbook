import React, { useState } from "react";
import {
  knowledgeRepository as repository,
  libraryHref,
  entryHref,
} from "../data/knowledgeRepository.js";
import Link from "../components/Link.jsx";

export default function IndexPage({ kind }) {
  const [letter, setLetter] = useState("");
  if (kind === "glossary") {
    const glossary = repository.getGlossary();
    const initial = (term) =>
      /^[A-Za-z]/.test(term) ? term[0].toUpperCase() : "#";
    const letters = [
      ...new Set(glossary.map((item) => initial(item.term))),
    ].sort();
    const items = glossary.filter(
      (item) => !letter || initial(item.term) === letter,
    );
    return (
      <div className="page">
        <div className="eyebrow">TERMINOLOGY INDEX</div>
        <h1>Glossary</h1>
        <p className="page-intro">
          Titles and aliases, linked to their full reference notes.
        </p>
        <nav className="alphabet" aria-label="Glossary letters">
          <button aria-pressed={!letter} onClick={() => setLetter("")}>
            All
          </button>
          {letters.map((value) => (
            <button
              key={value}
              aria-pressed={letter === value}
              onClick={() => setLetter(value)}
            >
              {value}
            </button>
          ))}
        </nav>
        <div className="glossary-list">
          {items.map(({ term, entry, alias }) => (
            <Link key={`${entry.id}:${term}`} href={entryHref(entry)}>
              <strong>{term}</strong>
              <div>
                {alias && (
                  <span className="muted">Alias of {entry.title} · </span>
                )}
                <span>{entry.summary || entry.category}</span>
              </div>
              <span>↗</span>
            </Link>
          ))}
        </div>
        {!items.length && (
          <div className="empty">
            <p>No glossary terms yet.</p>
          </div>
        )}
      </div>
    );
  }
  const isCategory = kind === "categories";
  const groups = isCategory
    ? repository.getCategories()
    : kind === "topics"
      ? repository.getTags()
      : repository.getProjects();
  const title = isCategory
    ? "Categories"
    : kind === "topics"
      ? "Topics"
      : "Projects";
  return (
    <div className="page">
      <div className="eyebrow">KNOWLEDGE INDEX</div>
      <h1>{title}</h1>
      <p className="page-intro">
        {isCategory
          ? "Subjects and subcategories drawn from your notes."
          : kind === "topics"
            ? "Shared tags connect details across the library."
            : "Knowledge connected to real project situations."}
      </p>
      <div className="index-grid">
        {groups.map((group) => (
          <article className="index-card" key={group.name}>
            <Link
              className="index-title"
              href={
                isCategory
                  ? `/category/${group.slug}`
                  : libraryHref({
                      [kind === "topics" ? "tag" : "project"]: group.name,
                    })
              }
            >
              <h2>{group.name}</h2>
              <span>
                {group.count} {group.count === 1 ? "entry" : "entries"} ↗
              </span>
            </Link>
            {isCategory && (
              <div className="subcategory-links">
                {group.subcategories.length ? (
                  group.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory}
                      href={libraryHref({ category: group.name, subcategory })}
                    >
                      {subcategory}
                    </Link>
                  ))
                ) : (
                  <span className="muted">General reference</span>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      {!groups.length && (
        <div className="empty">
          <p>
            {kind === "projects"
              ? "No entries are associated with a project yet."
              : "No topics found. Add tags to your notes."}
          </p>
        </div>
      )}
    </div>
  );
}
