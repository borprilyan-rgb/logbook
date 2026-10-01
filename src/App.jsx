import React, { useEffect, useMemo, useRef, useState } from "react";
import { knowledgeRepository as repository } from "./data/knowledgeRepository.js";
import { slugify } from "./utils/knowledge.js";
import { navigate } from "./utils/navigation.js";
import usePersonal from "./hooks/usePersonal.js";
import Link from "./components/Link.jsx";
import Library from "./pages/Library.jsx";
import Entry from "./pages/Entry.jsx";
import Home from "./pages/Home.jsx";
import IndexPage from "./pages/IndexPage.jsx";

const navigation = [
  ["/", "Overview", "⌂"],
  ["/library", "Knowledge Library", "▤"],
  ["/categories", "Categories", "▦"],
  ["/topics", "Topics", "#"],
  ["/projects", "Projects", "◇"],
  ["/glossary", "Glossary", "Aa"],
  ["/bookmarks", "Bookmarks", "☆"],
  ["/needs-review", "Needs Review", "◷"],
];
export default function App() {
  const [location, setLocation] = useState(
    () => window.location.pathname + window.location.search,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const sidebar = useRef(null);
  const searchRequested = useRef(false);
  const all = useMemo(() => repository.getAllEntries(), []);
  const categories = repository.getCategories();
  useEffect(() => {
    const shortcut = (event) => {
      const editing = event.target?.matches?.(
        'input, textarea, select, [contenteditable="true"]',
      );
      const searchShortcut =
        (!editing && event.key === "/") ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k");
      if (
        !event.defaultPrevented &&
        searchShortcut &&
        !document.querySelector('input[aria-label="Search knowledge entries"]')
      ) {
        event.preventDefault();
        searchRequested.current = true;
        navigate("/library");
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (searchRequested.current) {
      document
        .querySelector('input[aria-label="Search knowledge entries"]')
        ?.focus();
      searchRequested.current = false;
    }
  }, [location]);
  useEffect(() => {
    const update = () => {
      setLocation(window.location.pathname + window.location.search);
      setMenuOpen(false);
    };
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    sidebar.current?.querySelector("a")?.focus();
    const close = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const links = [...sidebar.current.querySelectorAll("a, button")];
        if (event.shiftKey && document.activeElement === links[0]) {
          event.preventDefault();
          links.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === links.at(-1)) {
          event.preventDefault();
          links[0]?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  const url = new URL(location, window.location.origin);
  const path = url.pathname.replace(/\/$/, "") || "/";
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    /* malformed route becomes a normal missing page */
  }
  const entry = decoded.startsWith("/knowledge/")
    ? repository.getEntryBySlug(decoded.slice(11))
    : decoded.startsWith("/entry/")
      ? repository.getEntryByLegacyId(decoded.slice(7)) ||
        repository.getEntryBySlug(decoded.slice(7))
      : null;
  const categorySlug = decoded.startsWith("/category/")
    ? decoded.slice(10)
    : "";
  const category =
    categories.find((item) => item.slug === categorySlug)?.name ||
    (categorySlug
      ? categorySlug
          .split("-")
          .map((word) => word[0]?.toUpperCase() + word.slice(1))
          .join(" ")
      : "");
  const { personal, toggle, storageFailed } = usePersonal(all, entry);
  const pageName =
    entry?.title ||
    category ||
    navigation.find(([href]) => href === path)?.[1] ||
    "Page not found";
  useEffect(() => {
    document.title = `${pageName} — QS knowledge base`;
  }, [pageName]);
  let content;
  if (entry)
    content = <Entry entry={entry} personal={personal} toggle={toggle} />;
  else if (path === "/")
    content = (
      <Home url={url} entries={all} personal={personal} toggle={toggle} />
    );
  else if (
    category ||
    ["/library", "/bookmarks", "/needs-review"].includes(path)
  )
    content = (
      <Library
        url={url}
        category={category}
        mode={
          path === "/bookmarks"
            ? "bookmarks"
            : path === "/needs-review"
              ? "review"
              : ""
        }
        personal={personal}
        toggle={toggle}
      />
    );
  else if (["/categories", "/topics", "/projects", "/glossary"].includes(path))
    content = <IndexPage key={path} kind={path.slice(1)} />;
  else
    content = (
      <div className="page empty">
        <h1>Page not found</h1>
        <p>This reference may have moved.</p>
        <Link href="/library">Browse the library →</Link>
      </div>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <button
        ref={menuButton}
        className="menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰ <span>Fieldnotes</span>
      </button>
      {menuOpen && (
        <button
          className="drawer-backdrop"
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="sidebar"
        className={`sidebar ${menuOpen ? "open" : ""}`}
      >
        <Link href="/" className="brand">
          <span className="brand-mark">f.</span>
          <span>
            fieldnotes<span className="brand-sub">QS KNOWLEDGE BASE</span>
          </span>
        </Link>
        <div className="sidebar-scroll">
          <div className="workspace-label">PERSONAL WORKSPACE</div>
          <nav aria-label="Main navigation">
            {navigation.map(([href, label, icon]) => (
              <Link
                href={href}
                key={href}
                className={`nav-item ${path === href ? "active" : ""}`}
                aria-current={path === href ? "page" : undefined}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
                {href === "/library" && <small>{all.length}</small>}
                {href === "/bookmarks" && (
                  <small>{personal.bookmarks.length}</small>
                )}
              </Link>
            ))}
          </nav>
          <div className="workspace-label category-label">SUBJECTS</div>
          <nav aria-label="Categories">
            {categories.map((item) => (
              <Link
                key={item.name}
                href={`/category/${slugify(item.name)}`}
                className={`nav-item ${category === item.name ? "active" : ""}`}
              >
                <span className="category-dot" />
                <span>{item.name}</span>
                <small>{item.count}</small>
              </Link>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">LOCAL MARKDOWN LIBRARY</div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span> {pageName}
          </span>
          <span className="topbar-right">
            <span className="status-dot" /> Device-local reference{" "}
            <span className="avatar">QS</span>
          </span>
        </header>
        {storageFailed && (
          <div className="storage-warning" role="status">
            Browser storage is unavailable. Bookmarks and reading activity will
            last only for this session.
          </div>
        )}
        <main id="main-content">{content}</main>
        <footer className="main-footer">
          <span>FIELDNOTES / QUANTITY SURVEYING</span>
          <span>Knowledge that builds over time.</span>
        </footer>
      </div>
    </div>
  );
}
