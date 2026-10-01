import React from "react";
import { knowledgeRepository as repository } from "../data/knowledgeRepository.js";
import SearchBox from "../components/SearchBox.jsx";
import Filters, { filterKeys } from "../components/Filters.jsx";
import EntryList from "../components/EntryList.jsx";
import { navigate, updateParams } from "../utils/navigation.js";

export default function Library({ url, category, mode, personal, toggle }) {
  const params = url.searchParams;
  const query = params.get("q") || "";
  const filters = Object.fromEntries(
    filterKeys.map((key) => [key, params.get(key) || ""]),
  );
  if (category) filters.category = category;
  if (mode === "review") filters.needsReview = true;
  const requestedSort = params.get("sort");
  const sort = [
    "title",
    "created",
    "updated",
    "importance",
    "category",
    "relevance",
  ].includes(requestedSort)
    ? requestedSort
    : undefined;
  let results = repository.searchEntries(query, filters, sort);
  if (mode === "bookmarks")
    results = results.filter((entry) => personal.bookmarks.includes(entry.id));
  const change = (changes) => {
    const next = updateParams(params, changes);
    navigate(url.pathname + (next.size ? `?${next}` : ""), true);
  };
  const title = category
    ? `${category} entries`
    : mode === "review"
      ? "Needs Review"
      : mode === "bookmarks"
        ? "Bookmarks"
        : "Knowledge Library";
  const hasFilters =
    query || filterKeys.some((key) => key !== "project" && params.has(key));
  return (
    <div className="page library-page">
      <div className="eyebrow">REFERENCE LIBRARY</div>
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>
            {mode === "review"
              ? "Draft and learning notes to develop into reliable references."
              : mode === "bookmarks"
                ? "Your saved references, stored on this device."
                : "Find concepts, compare details, and return to useful knowledge."}
          </p>
        </div>
      </div>
      <SearchBox value={query} onChange={(value) => change({ q: value })} />
      <Filters params={params} fixedCategory={category} onChange={change} />
      <div className="results-toolbar">
        <span aria-live="polite">
          {results.length} {results.length === 1 ? "entry" : "entries"}
          {hasFilters ? " matching your search and filters" : ""}
        </span>
        <label>
          Sort by{" "}
          <select
            value={sort || (query.trim() ? "relevance" : "updated")}
            onChange={(event) => change({ sort: event.target.value })}
          >
            <option value="relevance">Relevance</option>
            <option value="updated">Recently updated</option>
            <option value="created">Newest created</option>
            <option value="title">Title</option>
            <option value="importance">Importance</option>
            <option value="category">Category</option>
          </select>
        </label>
      </div>
      <EntryList
        entries={results}
        toggle={toggle}
        bookmarks={personal.bookmarks}
        empty={
          hasFilters
            ? "No knowledge entries found. Try fewer filters or a broader search."
            : mode === "bookmarks"
              ? "No bookmarked entries yet. Use the star beside an entry to save it."
              : mode === "review"
                ? "No notes need review. Draft and learning notes will appear here."
                : params.get("project")
                  ? "No entries are associated with this project."
                  : "No knowledge entries found. Add a Markdown note to this category."
        }
      />
    </div>
  );
}
