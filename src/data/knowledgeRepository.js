import { entries } from "./entries.js";
import {
  getFacets,
  searchEntries,
  relatedEntries,
  sortEntries,
} from "../utils/knowledge.js";

// The UI depends on this interface, not on Vite's file loader.
export const knowledgeRepository = {
  getAllEntries: () => sortEntries(entries),
  getEntryBySlug: (slug) => entries.find((entry) => entry.slug === slug),
  getEntryByLegacyId: (id) => entries.find((entry) => entry.legacyId === id),
  getCategories: () => getFacets(entries, "category"),
  getTags: () => getFacets(entries, "tags"),
  getProjects: () => getFacets(entries, "projectRelated"),
  getSubcategories: () => getFacets(entries, "subcategory"),
  searchEntries: (query, filters, sort) =>
    searchEntries(entries, query, filters, sort),
  getRelatedEntries: (entry) => relatedEntries(entries, entry),
  getGlossary: () =>
    entries
      .filter((entry) => !entry.error)
      .flatMap((entry) =>
        [entry.title, ...entry.aliases].map((term) => ({
          term,
          entry,
          alias: term !== entry.title,
        })),
      )
      .sort((a, b) => a.term.localeCompare(b.term)),
};
export const entryHref = (entry) =>
  `/knowledge/${encodeURIComponent(entry.slug)}`;
export const libraryHref = (filters) =>
  `/library?${new URLSearchParams(filters)}`;
