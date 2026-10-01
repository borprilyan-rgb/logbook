# Fieldnotes — QS Personal Knowledge Base

A local-first technical reference for Quantity Surveying and construction learning. Capture concepts as Markdown, retrieve them with ranked search and combined filters, and gradually turn draft notes into reliable references. React + Vite, JavaScript, and plain CSS; no backend, authentication, AI, or external API integration.

## Development

Use Node.js 20.19+ or 22.12+ (Node 24 works).

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Open the URL printed by Vite. On Windows PowerShell, use `npm.cmd` when execution policy blocks `npm.ps1`. `npm test` runs content, search/filter, local-storage, routing, and Markdown-rendering tests with Node's built-in test runner. Build output is in `dist/`.

## Architecture

```text
knowledge/                    Markdown content grouped into folders
src/
  App.jsx                     Layout, pathname routing, shared local activity
  main.jsx                    React entry point
  components/
    Link.jsx                  History API links with normal new-tab behavior
    SearchBox.jsx             Search input and simple keyboard shortcuts
    Filters.jsx               Seven combined metadata filters
    EntryCard.jsx             Compact reference row with bookmark control
    EntryList.jsx             Shared lists and empty states
    Markdown.jsx              GFM tables, links, callouts, collapsible contents
  pages/
    Home.jsx                  Personal dashboard and global search
    Library.jsx               Library, category, bookmarks, review views
    Entry.jsx                 Metadata, content, and related references
    IndexPage.jsx             Categories, topics, projects, glossary
  data/
    entries.js                The only Vite glob import; isolated file parsing
    knowledgeRepository.js    UI-facing retrieval/search/index interface
  hooks/usePersonal.js        Shared device-local bookmark/history state
  utils/
    knowledge.js              Parsing, validation, facets, ranking, relations
    personal.js               Storage validation and activity operations
    markdown.js               Markdown AST heading IDs, TOC, and callouts
    navigation.js             Navigation and query-parameter updates
  styles/app.css              Responsive technical-notebook layout
tests/                        Node tests and React server-render checks
```

Vite eagerly loads `knowledge/**/*.md` as raw text. YAML frontmatter becomes a normalized entry object; the remaining text is the body. UI modules call `knowledgeRepository`, so file loading remains separate from presentation. Data is bundled at build time: Markdown edits appear during development, while deployed content updates require rebuilding.

`react-markdown` renders Markdown, `remark-gfm` adds tables and other GFM features, and a small local remark plugin supplies heading IDs, TOC, and callout labels. It works on the parsed Markdown tree so fenced code cannot produce false headings. Raw HTML is not rendered as executable HTML. Typography uses system fonts and needs no external font service.

## Create a knowledge entry

Create `knowledge/concrete/concrete-cover.md`. Only `title` is required. Here is a complete example; its technical body is intentionally a learning placeholder:

```markdown
---
title: Concrete Cover
slug: concrete-cover
category: Concrete
subcategory: Reinforcement Details
tags:
  - concrete
  - reinforcement
aliases:
  - Reinforcement Cover
created: 2026-10-01
updated: 2026-10-01
summary: A note for interpreting the reinforcement-cover requirements on a project.
status: learning
difficulty: basic
importance: high
sourceType: learning-note
projectRelated:
  - Demo Project
standards:
  - Project-specific standard — add exact edition
---

## Quick Answer

Concrete cover is the distance between reinforcement and the concrete surface.
Confirm the required value in the approved drawings and specification.

## Working Knowledge

Add the project-specific interpretation and supporting references here.

> [!WARNING]
> Do not use a generic cover value without checking the design requirement.

## Practical QS Notes

| Item     | Check                              |
| -------- | ---------------------------------- |
| Drawings | Revision and detail reference      |
| Pricing  | Required spacers and support scope |

## Example

Demo Project is a fictional association demonstrating the project index.

## Related Topics

- [Concrete Curing](/knowledge/concrete-curing)

## Sources

- Reference placeholder: approved structural drawings and specification.
```

### Supported frontmatter

| Field             | Type                                        | Behavior when absent                                       |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------- |
| `title`           | Nonempty string                             | Required; invalid notes get an error fallback              |
| `slug`            | String                                      | Derived from the filename, normalized to lowercase hyphens |
| `category`        | String                                      | `Uncategorized`                                            |
| `subcategory`     | String                                      | Empty                                                      |
| `summary`         | String                                      | Empty                                                      |
| `tags`, `aliases` | Lists of strings                            | Empty lists                                                |
| `created`         | `YYYY-MM-DD`                                | No fabricated date; displayed as not recorded              |
| `updated`         | `YYYY-MM-DD`                                | Falls back to `created`, or no date                        |
| `status`          | `draft`, `learning`, `reviewed`, `verified` | `draft`                                                    |
| `difficulty`      | `basic`, `intermediate`, `advanced`         | `basic`                                                    |
| `importance`      | `low`, `medium`, `high`                     | `medium`                                                   |
| `sourceType`      | String                                      | Empty; e.g. learning-note, reference, project-note         |
| `projectRelated`  | List of project names                       | Empty list                                                 |
| `standards`       | List of standard names/editions             | Empty list                                                 |
| `featured`        | Boolean                                     | Legacy metadata accepted; home frequency uses real views   |

Quote YAML values containing a colon followed by a space. Use actual lists for list fields. Invalid optional values are ignored or defaulted, with warnings attached to the entry and logged in development. Broken YAML, missing titles, and duplicate slugs produce individual error cards and detail fallbacks instead of crashing the app. The source-file disclosure shows warnings; fix the file to restore it. Tests intentionally reject malformed repository content so problems can be caught before publishing.

### Categories, topics, projects, and glossary

Categories are generated from metadata; no code change is needed to add a subject. Folder names are organizational and do not determine category. The Categories page shows counts and subcategory links. Category URLs use normalized category names, so keep category names distinct after normalization.

Tags generate the Topics index and link to exact tag filters. Project names generate the Projects index and filter library results. Keep spelling and capitalization consistent: metadata filters and relation checks use exact values. Project associations are just names on notes, not a separate database. Demo Project in the samples is fictional and should be replaced or removed when adding real notes.

The Glossary lists every title and alias with an alphabetical selector, summary, and link to the original note. It introduces no separate glossary content store.

### Status and review workflow

- **Draft:** rough or incomplete note.
- **Learning:** a concept still being understood.
- **Reviewed:** understood reasonably well after personal review.
- **Verified:** checked against an identified reliable source or standard.

Needs Review collects draft and learning entries. Review Random Topic chooses a learning entry first; if none exist, it chooses a reviewed entry. It is disabled if neither pool is available. Status changes are made in Markdown. There is no spaced repetition or editing interface. Sample notes remain draft/learning; none are marked verified merely because they include a publisher link.

Difficulty describes the depth of the note, while importance controls prioritization; neither implies that the content is verified. Git remains the actual version history. Update `updated` manually when changing a note.

## URLs and navigation

- `/`: dashboard and global search.
- `/library`: compact reference library.
- `/category/concrete`: category-specific library.
- `/categories`, `/topics`, `/projects`, `/glossary`: generated indexes.
- `/bookmarks`: saved entries.
- `/needs-review`: draft and learning entries.
- `/knowledge/concrete-k-grade`: canonical entry URL.
- `/entry/concrete/concrete-k-grade`: preserved original entry URL.

Explicit slugs remain stable across folder moves and filename changes when the slug value is kept. Without a slug, the filename stem becomes the canonical slug, so moving between folders does not change the canonical URL. Slugs must be unique across the repository. Old `/entry/<relative-file-path>` links continue to work for existing files; a file move changes that legacy path. Existing Markdown links and original seven notes are retained.

Search, filters, and sorting are query parameters, such as `/library?q=concrete&status=learning&project=Demo+Project`. Browser back/forward updates the view; filter changes replace the current history entry to avoid one back-button step per keystroke. Links support Ctrl/Cmd-click and opening in new tabs. Heading anchors use native fragment navigation.

A deployed static host **must rewrite unknown application paths to `index.html`** for direct entry links and refreshes. Serve at the domain root; subdirectory deployment would need base-path support.

## Search, filtering, and sorting

Search runs locally over title, aliases, summary, category, subcategory, tags, body, project names, and standards. It ignores case and punctuation and supports partial terms, so `K350` matches `K-350`. All query terms must occur somewhere in the entry. It is not fuzzy/typo-correcting search.

Default search relevance uses the strongest matching field: exact title, alias, title partial, tags, category/subcategory, summary, body. Project and standards matches sit between category and summary. Ties use title order. Each row shows the fields that matched. With no query, the library defaults to recently updated. Explicit sorting overrides relevance; title, creation date, update date, importance, category, and relevance are available. Missing dates sort after known dates.

Category, subcategory, tag, status, difficulty, importance, and project filters combine with AND logic and remain client-side. Each filter accepts one value. Reset filters clears all seven optional selectors while retaining search and sorting. On a category page, the route's category remains fixed; use the main Library to search every category.

### Related references

Related Entries scores each other healthy note: 3 points per shared tag, 4 per shared project, 2 for the same category, and 3 for the same nonempty subcategory. Highest scores come first, with title breaking ties; the current entry is excluded. Separate Same Category and Same Project sections provide additional browsing paths. Related Topics links to the entry's tag filters. No semantic or AI matching is involved.

## Markdown features

Headings, paragraphs, bold/italic, lists, tables, blockquotes, inline/fenced code, links, and horizontal rules are supported. Tables have a horizontal scroll container with keyboard focus. GFM task lists and strikethrough also render.

Entries with at least three level 1–3 headings get a contents panel built from those headings. It opens and stays sticky on wide desktops; it starts collapsed on smaller screens. Duplicate headings receive distinct IDs. Supported blockquote markers are `[!NOTE]`, `[!WARNING]`, `[!QS]`, and `[!EXAMPLE]`. Use normal Markdown Sources sections and links; there is no citation automation.

`/` and Ctrl/Cmd+K focus search; from an entry or index page they open the library and focus its search. Escape clears a focused search and closes the navigation drawer. The tablet/mobile drawer also closes on navigation or backdrop click, with a basic focus trap. Tags wrap; technical tables scroll without widening the page.

## Bookmarks and reading activity

The `fieldnotes.personal.v1` localStorage key contains only:

```json
{
  "bookmarks": ["concrete-k-grade"],
  "recent": ["slump", "concrete-k-grade"],
  "views": { "slump": 2, "concrete-k-grade": 1 }
}
```

Bookmarks survive refresh. Recent IDs are deduplicated and limited to ten. View counts increment when an entry is opened, including a fresh page load, with a guard against React StrictMode counting its repeated effect twice. Search or bookmark changes while an entry remains open do not count another view. Home frequency uses actual local view counts, with an empty state until activity exists.

Storage is device/browser/origin-local, contains no Markdown bodies, and does not sync to another device. Removed entry IDs are discarded on load. Invalid storage falls back safely. When storage is blocked or full, the app keeps session state and displays a persistence message. Other tabs receive storage updates; simultaneous writes are last-write-wins. Clearing browser site data clears this activity.

## Dependencies

Runtime: `react`, `react-dom`, `react-markdown`, `yaml`, and **`remark-gfm`** (the only added dependency in this expansion). Development: `vite`. No UI framework, router package, state-management package, backend, or editor is included.

## Limitations and sensible next improvements

- All notes ship in the client bundle. A deployed library is readable by anyone who can access it; this is not private document storage.
- Metadata and content are edited in repository files, then rebuilt for production. There is no in-browser editor.
- The 22 sample entries are concise learning notes, with reference placeholders and fictional project associations clearly marked. Check exact standards and contract editions; the FIDIC outlines make no definitive clause interpretation.
- Search is a simple linear scan suitable for a modest library. The Markdown/YAML/GFM bundle may trigger Vite's 500 kB chunk advisory; the build still succeeds. Consider lazy-loading the renderer only if size or retrieval speed becomes a problem.
- Dates, statuses, importance, and standards are self-maintained. Listing a standard does not mean the note was checked against it.
- Automated tests cover parsing, relations, filters, storage operations, route rendering, and technical Markdown. Interactive visual validation requires an available browser.

Recommended next work: add reliable, edition-specific sources and real project examples; review notes before marking them reviewed or verified; consider portable export/import of local activity when device migration becomes necessary. These improvements are not implemented here.

For a future backend, replace `entries.js` and the `knowledgeRepository` implementation with asynchronous data access, retaining the normalized entry shape and stable slugs. Add loading/error states at that boundary. Search, relation scoring, presentation, and personal activity remain separate. A Supabase migration should consider content access rules and whether device-local activity should be migrated; no database work has been introduced now.
