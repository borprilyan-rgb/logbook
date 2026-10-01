import React, { useEffect, useRef } from "react";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search titles, aliases, standards, or full notes…",
}) {
  const input = useRef(null);
  useEffect(() => {
    const shortcut = (event) => {
      const editing = event.target?.matches?.(
        'input, textarea, select, [contenteditable="true"]',
      );
      if (
        (!editing && event.key === "/") ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")
      ) {
        event.preventDefault();
        input.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === input.current) {
        onChange("");
        input.current.blur();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [onChange]);
  return (
    <>
      <div className="search-box">
        <span aria-hidden="true" className="search-icon">
          ⌕
        </span>
        <input
          ref={input}
          aria-label="Search knowledge entries"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {value ? (
          <button aria-label="Clear search" onClick={() => onChange("")}>
            ×
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>
      <div className="search-hint">
        Search notes, project names, and standards. Press / to focus; Escape to
        clear.
      </div>
    </>
  );
}
