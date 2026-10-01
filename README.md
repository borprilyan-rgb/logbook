# Fieldnotes

A personal Quantity Surveying knowledge base built with React, Vite, JavaScript, and plain CSS. Entries are repository Markdown files; there is no backend or authentication.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Node 24 also works).

```sh
npm install
npm run dev
```

Open the URL printed by Vite. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```sh
npm test
npm run build
npm run preview
```

## Structure

```text
knowledge/             Markdown source files grouped by subject
src/components/        Internal links and entry cards
src/pages/             Library/search and entry detail pages
src/data/entries.js    Vite Markdown loading adapter
src/utils/knowledge.js Frontmatter validation, search, related entries
src/styles/app.css     Responsive notebook interface
src/App.jsx            Layout and pathname routing
```

## Add an entry

Create a Markdown file such as `knowledge/concrete/concrete-cover.md`:

```markdown
---
title: Concrete Cover
category: Concrete
tags:
  - concrete
  - durability
created: 2026-10-01
summary: Distance between reinforcement and the concrete surface.
featured: false
---

## Quick Answer

Your explanation here.

## Practical QS Notes

- Your practical observations.

## Sources

- A source link or project reference.
```

The title, category, created date, and summary are required. Use a valid ISO date (`YYYY-MM-DD`). Tags are an optional list of strings. `featured: true` adds an entry to the home page's frequently referenced topics; this is an editorial selection, not usage tracking. Categories are Concrete, Tender, Contract, Measurement, Materials, Site Work, and Cost Estimating. Add new category names in `categoryNames` and update the descriptions in `Library.jsx` if expanding the taxonomy.

An entry's URL comes from its relative file path: this example becomes `/entry/concrete/concrete-cover`. Keep filenames lowercase with hyphens. Renaming or moving a file changes its URL. Internal entry links use these app paths, for example `[Slump](/entry/concrete/slump)`. Sections are optional and can be arranged as needed. Use standard Markdown headings, lists, links, code, and quotes. Raw HTML is not rendered.

## How loading and search work

Vite's eager `import.meta.glob` reads `knowledge/**/*.md` as raw strings at build time. `parseEntry` reads YAML frontmatter using `yaml`, validates metadata, and separates the body. `react-markdown` renders the body. Malformed metadata fails loudly with the source filename. Vite picks up content changes during development; production content updates require a rebuild.

Search is synchronous and local. It matches all space-separated terms across title, summary, tags, category, and Markdown body, ignores case, and ranks title/tag matches higher. Result cards identify matching fields. Category pages restrict results to that category. Search queries are reflected in the URL, and Ctrl/Cmd+K focuses search. Related entries are ranked by the number of shared tags. Recently added entries use the metadata date, with titles breaking date ties.

Routing uses the History API and pathname rather than hash URLs. It supports `/`, `/library`, `/category/concrete`, and `/entry/concrete/slump`, with ordinary anchor links for opening new tabs. A production static host must rewrite unknown paths to `index.html` for direct links and refreshes. Serve from the domain root; subdirectory deployments need base-path support.

## Dependencies and future work

Runtime: `react`, `react-dom`, `react-markdown`, `yaml`. Development: `vite`. No UI framework or state-management library is used. Typography uses optional Google Fonts with system fallbacks; the app remains usable without them.

All entries ship in the client bundle and are public to anyone with access to the deployed app. This is suitable for a modest personal library, not private document storage. There is no in-app editing, full-text index, real visit tracking, or GitHub-flavoured Markdown tables. Example entries are starter learning notes with project-specific verification reminders, not authoritative technical specifications.

Sensible next steps: add verified sources and personal notes, grow the taxonomy, then consider a search index or lazy loading if the library becomes large. To migrate to a backend, replace `src/data/entries.js` with a loading adapter that returns the same entry shape and add asynchronous loading/error states. Keep rendering, search, and related-topic functions independent of the storage provider.
