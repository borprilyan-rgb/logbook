import { parse } from "yaml";

export const statuses = ["draft", "learning", "reviewed", "verified"];
export const difficulties = ["basic", "intermediate", "advanced"];
export const importances = ["low", "medium", "high"];
export const slugify = (value) =>
  String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
const text = (value) => (typeof value === "string" ? value.trim() : "");

export function parseEntry(raw, file) {
  const sourceFile = file
    .replaceAll("\\", "/")
    .replace(/^.*?knowledge\//, "knowledge/");
  const legacyId = sourceFile.replace(/^knowledge\//, "").replace(/\.md$/i, "");
  const defaultSlug = slugify(legacyId.split("/").at(-1)) || "untitled";
  const match = raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match)
    throw new Error(`${sourceFile}: expected YAML frontmatter enclosed by ---`);
  let meta;
  try {
    meta = parse(match[1]);
  } catch (error) {
    throw new Error(`${sourceFile}: ${error.message}`);
  }
  if (
    !meta ||
    typeof meta !== "object" ||
    Array.isArray(meta) ||
    !text(meta.title)
  )
    throw new Error(`${sourceFile}: title must be a nonempty string`);
  const warnings = [];
  const optionalText = (key) => {
    if (meta[key] != null && typeof meta[key] !== "string")
      warnings.push(`${key} should be a string; ignored`);
    return text(meta[key]);
  };
  const list = (key) => {
    if (meta[key] == null) return [];
    if (!Array.isArray(meta[key])) {
      warnings.push(`${key} should be a list; ignored`);
      return [];
    }
    if (meta[key].some((value) => typeof value !== "string"))
      warnings.push(`${key}: non-string items ignored`);
    return [
      ...new Set(
        meta[key]
          .filter((value) => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];
  };
  const choice = (key, values, fallback) => {
    if (meta[key] == null) return fallback;
    const value = text(meta[key]).toLowerCase();
    if (values.includes(value)) return value;
    warnings.push(`${key}: unsupported value; using ${fallback}`);
    return fallback;
  };
  const date = (key) => {
    if (meta[key] == null) return "";
    const value = text(meta[key]);
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value
    )
      return value;
    warnings.push(`${key}: expected a valid YYYY-MM-DD date; ignored`);
    return "";
  };
  let slug = defaultSlug;
  if (meta.slug != null) {
    slug = slugify(optionalText("slug"));
    if (!slug)
      throw new Error(`${sourceFile}: slug must contain letters or numbers`);
  }
  const created = date("created");
  return {
    id: slug,
    slug,
    legacyId,
    sourceFile,
    title: meta.title.trim(),
    category: optionalText("category") || "Uncategorized",
    subcategory: optionalText("subcategory"),
    summary: optionalText("summary"),
    tags: list("tags"),
    aliases: list("aliases"),
    projectRelated: list("projectRelated"),
    standards: list("standards"),
    created,
    updated: date("updated") || created,
    status: choice("status", statuses, "draft"),
    difficulty: choice("difficulty", difficulties, "basic"),
    importance: choice("importance", importances, "medium"),
    sourceType: optionalText("sourceType"),
    body: match[2].trim(),
    featured: meta.featured === true,
    warnings,
  };
}

// Isolate each file so an invalid note cannot stop the rest of the library.
export function loadEntries(files, warn = () => {}) {
  const seen = new Set();
  return Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([file, raw]) => {
      let entry;
      try {
        entry = parseEntry(raw, file);
        if (seen.has(entry.slug))
          throw new Error(
            `${entry.sourceFile}: duplicate slug "${entry.slug}"; add a unique frontmatter slug`,
          );
      } catch (error) {
        const sourceFile = file
          .replaceAll("\\", "/")
          .replace(/^.*?knowledge\//, "knowledge/");
        const legacyId = sourceFile
          .replace(/^knowledge\//, "")
          .replace(/\.md$/i, "");
        let slug = slugify(legacyId) || "invalid-note";
        while (seen.has(slug)) slug += "-invalid";
        entry = {
          id: slug,
          slug,
          legacyId,
          sourceFile,
          title: legacyId.split("/").at(-1).replaceAll("-", " "),
          category: "Uncategorized",
          subcategory: "",
          summary:
            "This note could not be loaded. Check its Markdown frontmatter.",
          tags: [],
          aliases: [],
          projectRelated: [],
          standards: [],
          created: "",
          updated: "",
          status: "draft",
          difficulty: "basic",
          importance: "medium",
          sourceType: "",
          body: "",
          warnings: [],
          error: error.message,
        };
        warn(error.message);
      }
      seen.add(entry.slug);
      entry.warnings.forEach((message) =>
        warn(`${entry.sourceFile}: ${message}`),
      );
      return entry;
    });
}

export function getFacets(entries, field) {
  const groups = new Map();
  for (const entry of entries) {
    const values = Array.isArray(entry[field]) ? entry[field] : [entry[field]];
    for (const value of new Set(values.filter(Boolean))) {
      if (!groups.has(value))
        groups.set(value, {
          name: value,
          slug: slugify(value),
          count: 0,
          subcategories: new Set(),
        });
      const group = groups.get(value);
      group.count++;
      if (entry.subcategory) group.subcategories.add(entry.subcategory);
    }
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      subcategories: [...group.subcategories].sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function sortEntries(entries, sort = "updated") {
  const importance = { high: 3, medium: 2, low: 1 };
  return [...entries].sort((a, b) => {
    let result = 0;
    if (sort === "relevance") result = (b.score || 0) - (a.score || 0);
    if (sort === "updated") result = b.updated.localeCompare(a.updated);
    if (sort === "created") result = b.created.localeCompare(a.created);
    if (sort === "importance")
      result = importance[b.importance] - importance[a.importance];
    if (sort === "category")
      result =
        a.category.localeCompare(b.category) ||
        a.subcategory.localeCompare(b.subcategory);
    return result || a.title.localeCompare(b.title);
  });
}

export function searchEntries(entries, query = "", filters = {}, sort) {
  if (typeof filters === "string") filters = { category: filters };
  const terms = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  const normalizedQuery = normalize(query);
  const results = entries
    .filter((entry) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === "needsReview")
          return !entry.error && ["draft", "learning"].includes(entry.status);
        const field = { tag: "tags", project: "projectRelated" }[key] || key;
        return Array.isArray(entry[field])
          ? entry[field].includes(value)
          : entry[field] === value;
      }),
    )
    .map((entry) => {
      const fields = {
        Title: entry.title,
        Aliases: entry.aliases.join(" "),
        Tags: entry.tags.join(" "),
        Category: entry.category,
        Subcategory: entry.subcategory,
        Summary: entry.summary,
        Project: entry.projectRelated.join(" "),
        Standards: entry.standards.join(" "),
        Content: entry.body,
      };
      const normalizedFields = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, normalize(value)]),
      );
      const matches = Object.keys(fields).filter((key) =>
        terms.some((term) => normalizedFields[key].includes(term)),
      );
      const included = terms.every((term) =>
        Object.values(normalizedFields).some((value) => value.includes(term)),
      );
      const weights = {
        Title: 600,
        Aliases: 800,
        Tags: 400,
        Category: 300,
        Subcategory: 300,
        Summary: 200,
        Project: 250,
        Standards: 250,
        Content: 100,
      };
      const score =
        normalizedQuery && normalizedFields.Title === normalizedQuery
          ? 1000
          : Math.max(0, ...matches.map((key) => weights[key]));
      return { ...entry, matches, score, included };
    })
    .filter((entry) => entry.included);
  return sortEntries(results, sort || (terms.length ? "relevance" : "updated"));
}

export function relatedEntries(entries, entry, limit = 6) {
  return entries
    .filter((other) => other.id !== entry.id && !other.error)
    .map((other) => {
      const shared = other.tags.filter((tag) =>
        entry.tags.includes(tag),
      ).length;
      const projects = other.projectRelated.filter((project) =>
        entry.projectRelated.includes(project),
      ).length;
      const score =
        shared * 3 +
        projects * 4 +
        (other.category === entry.category ? 2 : 0) +
        (entry.subcategory && other.subcategory === entry.subcategory ? 3 : 0);
      return { ...other, shared, score };
    })
    .filter((other) => other.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function chooseReviewEntry(entries, random = Math.random) {
  const eligible = entries.filter((entry) => !entry.error);
  const learning = eligible.filter((entry) => entry.status === "learning");
  const pool = learning.length
    ? learning
    : eligible.filter((entry) => entry.status === "reviewed");
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}
