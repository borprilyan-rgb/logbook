import test from "node:test";
import assert from "node:assert/strict";
import {
  parseEntry,
  loadEntries,
  searchEntries,
  sortEntries,
  relatedEntries,
  getFacets,
  chooseReviewEntry,
} from "../src/utils/knowledge.js";
import {
  emptyPersonal,
  readPersonal,
  recordView,
  savePersonal,
  toggleBookmark,
  STORAGE_KEY,
} from "../src/utils/personal.js";
import { updateParams } from "../src/utils/navigation.js";

const note = (metadata = "", body = "Body reference") =>
  parseEntry(
    `---\ntitle: Concrete K Grade\n${metadata}\n---\n${body}`,
    "/knowledge/concrete/concrete-k-grade.md",
  );
test("title-only entries supply safe defaults and keep filename-based IDs", () => {
  const entry = note();
  assert.equal(entry.slug, "concrete-k-grade");
  assert.equal(entry.legacyId, "concrete/concrete-k-grade");
  assert.equal(entry.category, "Uncategorized");
  assert.equal(entry.status, "draft");
  assert.equal(entry.difficulty, "basic");
  assert.equal(entry.updated, "");
  assert.deepEqual(entry.tags, []);
  assert.equal(note("slug: stable-note").slug, "stable-note");
});
test("invalid optional metadata is ignored with actionable warnings", () => {
  const entry = note(
    "tags: wrong\ncreated: 2026-02-30\nstatus: complete\nimportance: urgent\nprojectRelated: [Demo, 1]\nupdated: 2026-10-01",
  );
  assert.deepEqual(entry.tags, []);
  assert.deepEqual(entry.projectRelated, ["Demo"]);
  assert.equal(entry.created, "");
  assert.equal(entry.updated, "2026-10-01");
  assert.equal(entry.status, "draft");
  assert.equal(entry.importance, "medium");
  assert.equal(entry.warnings.length, 5);
});
test("bad YAML and duplicate slugs do not prevent healthy notes loading", () => {
  const warnings = [];
  const entries = loadEntries(
    {
      "/knowledge/a.md": "---\ntitle: Good\n---\nGood body",
      "/knowledge/b.md": "---\ntitle: [broken\n---\nBroken body",
      "/knowledge/c.md": "---\ntitle: Duplicate\nslug: a\n---\nDuplicate body",
    },
    (warning) => warnings.push(warning),
  );
  assert.equal(entries.length, 3);
  assert.equal(entries[0].title, "Good");
  assert.ok(entries[1].error.includes("b.md"));
  assert.ok(entries[2].error.includes("duplicate slug"));
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 3);
  assert.equal(warnings.length, 2);
});
test("search ranks exact title, alias, title partial, tags, category, summary, and body", () => {
  const base = note();
  const make = (id, changes) => ({ ...base, id, title: "Other", ...changes });
  const entries = [
    make("body", { body: "slump" }),
    make("summary", { summary: "slump" }),
    make("category", { category: "Slump" }),
    make("tag", { tags: ["slump"] }),
    make("partial", { title: "Slump Test" }),
    make("alias", { aliases: ["Slump"] }),
    make("exact", { title: "Slump" }),
  ];
  assert.deepEqual(
    searchEntries(entries, "SLUMP").map((entry) => entry.id),
    ["exact", "alias", "partial", "tag", "category", "summary", "body"],
  );
  assert.ok(
    searchEntries(
      [make("k", { aliases: ["K-350"] })],
      "k350",
    )[0].matches.includes("Aliases"),
  );
});
test("search includes standards, projects, and subcategories and combines all filters", () => {
  const entry = note(
    "category: Concrete\nsubcategory: Strength\ntags: [concrete]\nstatus: learning\ndifficulty: intermediate\nimportance: high\nprojectRelated: [Demo]\nstandards: [ASTM C143]",
  );
  const filters = {
    category: "Concrete",
    subcategory: "Strength",
    tag: "concrete",
    status: "learning",
    difficulty: "intermediate",
    importance: "high",
    project: "Demo",
  };
  assert.equal(searchEntries([entry], "c143 demo strength", filters).length, 1);
  assert.equal(
    searchEntries([entry], "", { ...filters, difficulty: "advanced" }).length,
    0,
  );
  assert.equal(searchEntries([entry], "", { needsReview: true }).length, 1);
  assert.equal(
    searchEntries([{ ...entry, status: "verified" }], "", { needsReview: true })
      .length,
    0,
  );
});
test("sorts reflect dates, importance, title, and category without mutating input", () => {
  const base = note();
  const entries = [
    {
      ...base,
      id: "a",
      title: "Alpha",
      updated: "2026-10-01",
      created: "2026-09-01",
      importance: "low",
      category: "Z",
    },
    {
      ...base,
      id: "b",
      title: "Beta",
      updated: "2026-10-02",
      created: "2026-09-02",
      importance: "high",
      category: "A",
    },
  ];
  for (const sort of ["updated", "created", "importance", "category"])
    assert.equal(sortEntries(entries, sort)[0].id, "b");
  assert.equal(sortEntries(entries, "title")[0].id, "a");
  assert.equal(entries[0].id, "a");
});
test("category facets and relation scores use metadata automatically", () => {
  const entry = note(
    "category: New Subject\nsubcategory: Topic\ntags: [shared]\nprojectRelated: [Demo]",
  );
  const simple = {
    ...entry,
    id: "simple",
    tags: [],
    subcategory: "",
    projectRelated: [],
  };
  const close = { ...entry, id: "close" };
  assert.deepEqual(getFacets([entry, simple, close], "category")[0], {
    name: "New Subject",
    slug: "new-subject",
    count: 3,
    subcategories: ["Topic"],
  });
  assert.equal(relatedEntries([entry, simple, close], entry)[0].id, "close");
  assert.ok(
    relatedEntries([entry, simple, close], entry).every(
      (other) => other.id !== entry.id,
    ),
  );
});
test("random review prefers learning and falls back to reviewed, not drafts or verified", () => {
  const learning = { ...note(), id: "learning", status: "learning" };
  const reviewed = { ...note(), id: "reviewed", status: "reviewed" };
  assert.equal(chooseReviewEntry([reviewed, learning], () => 0).id, "learning");
  assert.equal(chooseReviewEntry([reviewed], () => 0).id, "reviewed");
  assert.equal(chooseReviewEntry([note()]), null);
});
test("bookmarks survive storage round-trips without storing content", () => {
  const entry = note();
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  const state = toggleBookmark(emptyPersonal(), entry.id);
  assert.equal(savePersonal(storage, state), true);
  assert.deepEqual(readPersonal(storage, [entry]).bookmarks, [entry.id]);
  assert.ok(!values.get(STORAGE_KEY).includes("Body reference"));
  assert.deepEqual(toggleBookmark(state, entry.id).bookmarks, []);
});
test("recent history deduplicates and caps at ten; views count each opening", () => {
  let state = emptyPersonal();
  for (let index = 0; index < 12; index++)
    state = recordView(state, `entry-${index}`);
  state = recordView(state, "entry-5");
  assert.equal(state.recent.length, 10);
  assert.equal(new Set(state.recent).size, 10);
  assert.equal(state.recent[0], "entry-5");
  assert.equal(state.views["entry-5"], 2);
  assert.equal(recordView(emptyPersonal(), "constructor").views.constructor, 1);
});
test("storage handles bad JSON, unavailable storage, stale IDs, and legacy identifiers", () => {
  const entry = note();
  const storage = {
    getItem: () =>
      JSON.stringify({
        bookmarks: [entry.legacyId, "gone", entry.id],
        recent: [entry.id, entry.id],
        views: { [entry.id]: 3, gone: 99, other: -2 },
      }),
  };
  const state = readPersonal(storage, [entry]);
  assert.deepEqual(state.bookmarks, [entry.id]);
  assert.deepEqual(state.recent, [entry.id]);
  assert.deepEqual(state.views, { [entry.id]: 3 });
  assert.deepEqual(
    readPersonal({ getItem: () => "{" }, [entry]),
    emptyPersonal(),
  );
  assert.equal(
    savePersonal(
      {
        setItem: () => {
          throw new Error("blocked");
        },
      },
      state,
    ),
    false,
  );
});
test("URL filters combine and reset without losing search or sort", () => {
  const params = new URLSearchParams("q=concrete&sort=title&status=draft");
  const next = updateParams(params, { project: "Demo", difficulty: "basic" });
  assert.equal(next.get("q"), "concrete");
  assert.equal(next.get("status"), "draft");
  const reset = updateParams(next, { status: "", project: "", difficulty: "" });
  assert.equal(reset.toString(), "q=concrete&sort=title");
  assert.equal(params.get("project"), null);
});
