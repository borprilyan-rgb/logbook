import React from "react";
import {
  knowledgeRepository as repository,
  entryHref,
  libraryHref,
} from "../data/knowledgeRepository.js";
import { chooseReviewEntry, statuses } from "../utils/knowledge.js";
import { navigate, updateParams } from "../utils/navigation.js";
import SearchBox from "../components/SearchBox.jsx";
import EntryList from "../components/EntryList.jsx";
import Link from "../components/Link.jsx";

export default function Home({ url, entries, personal, toggle }) {
  const query = url.searchParams.get("q") || "";
  const categories = repository.getCategories();
  const projects = repository.getProjects();
  const valid = entries.filter((entry) => !entry.error);
  const byIds = (ids) =>
    ids.map((id) => entries.find((entry) => entry.id === id)).filter(Boolean);
  const frequent = valid
    .filter(
      (entry) =>
        Number.isSafeInteger(personal.views[entry.id]) &&
        personal.views[entry.id] > 0,
    )
    .sort(
      (a, b) =>
        personal.views[b.id] - personal.views[a.id] ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 5);
  const review = valid.filter((entry) =>
    ["draft", "learning"].includes(entry.status),
  );
  const canReview = valid.some((entry) =>
    ["learning", "reviewed"].includes(entry.status),
  );
  function search(value) {
    const next = updateParams(url.searchParams, { q: value });
    navigate("/" + (next.size ? `?${next}` : ""), true);
  }
  function randomReview() {
    const entry = chooseReviewEntry(valid);
    if (entry) navigate(entryHref(entry));
  }
  function section(title, list, empty, href) {
    return (
      <section>
        <div className="section-heading">
          <h2>{title}</h2>
          {href && <Link href={href}>View all →</Link>}
        </div>
        <EntryList
          entries={list}
          empty={empty}
          toggle={toggle}
          bookmarks={personal.bookmarks}
        />
      </section>
    );
  }
  return (
    <div className="page dashboard">
      <div className="eyebrow">PERSONAL TECHNICAL REFERENCE</div>
      <div className="page-heading">
        <div>
          <h1>QS Knowledge Base</h1>
          <p>
            Your working reference for quantities, construction, and contracts.
          </p>
        </div>
        <button onClick={randomReview} disabled={!canReview}>
          Review Random Topic ↗
        </button>
      </div>
      <SearchBox value={query} onChange={search} />
      {query.trim() ? (
        <section>
          <div className="section-heading">
            <h2>Search results</h2>
            <Link href={libraryHref({ q: query })}>Open library filters →</Link>
          </div>
          <EntryList
            entries={repository.searchEntries(query)}
            toggle={toggle}
            bookmarks={personal.bookmarks}
          />
        </section>
      ) : (
        <>
          <div className="stats">
            <div>
              <strong>{entries.length}</strong>
              <span>Total entries</span>
            </div>
            <div>
              <strong>{categories.length}</strong>
              <span>Categories</span>
            </div>
            {statuses.map((status) => (
              <div key={status}>
                <strong>
                  {valid.filter((entry) => entry.status === status).length}
                </strong>
                <span>{status}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-columns">
            {section(
              "Recently viewed",
              byIds(personal.recent),
              "Open a note to start your reading history.",
            )}
            {section(
              "Bookmarked",
              byIds(personal.bookmarks).slice(0, 5),
              "Save useful notes with the bookmark star.",
              "/bookmarks",
            )}
          </div>
          {section(
            "Recently updated",
            entries.slice(0, 5),
            "Add your first Markdown entry.",
            "/library",
          )}
          <div className="dashboard-columns">
            <section>
              <div className="section-heading">
                <h2>Frequently referenced topics</h2>
                <span>DEVICE-LOCAL ACTIVITY</span>
              </div>
              {frequent.length ? (
                <div className="reference-list">
                  {frequent.map((entry) => (
                    <Link key={entry.id} href={entryHref(entry)}>
                      <div>
                        <h3>{entry.title}</h3>
                        <p>{entry.category}</p>
                      </div>
                      <span className="reference-category">
                        {personal.views[entry.id]}{" "}
                        {personal.views[entry.id] === 1 ? "view" : "views"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <p>
                    Frequently viewed notes will appear as you use the library.
                  </p>
                </div>
              )}
            </section>
            {section(
              "Needs Review",
              review.slice(0, 3),
              "No draft or learning notes.",
              "/needs-review",
            )}
          </div>
          <section>
            <div className="section-heading">
              <h2>Categories</h2>
              <Link href="/categories">Browse all →</Link>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  className="category-card"
                  href={`/category/${category.slug}`}
                >
                  <div>
                    <strong>{category.name}</strong>
                    <span className="category-count">{category.count}</span>
                  </div>
                  <p>
                    {category.subcategories.join(" · ") || "General reference"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
          <section>
            <div className="section-heading">
              <h2>Projects</h2>
              <Link href="/projects">Browse all →</Link>
            </div>
            {projects.length ? (
              <div className="category-grid">
                {projects.map((project) => (
                  <Link
                    className="category-card"
                    key={project.name}
                    href={libraryHref({ project: project.name })}
                  >
                    <h3>{project.name}</h3>
                    <p>{project.count} related knowledge entries</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty">
                <p>
                  No project notes yet. Add projectRelated metadata to connect
                  your experience.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
