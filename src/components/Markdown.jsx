import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notebookMarkdown } from "../utils/markdown.js";
import Link from "./Link.jsx";

function Contents({ children }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    setOpen(desktop.matches);
    const update = () => setOpen(desktop.matches);
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, []);
  return (
    <details
      className="toc"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  );
}

export default function Markdown({ body }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, notebookMarkdown]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith("/") && !href.startsWith("//") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href}>{children}</a>
            ),
          table: ({ children }) => (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Technical reference table"
            >
              <table>{children}</table>
            </div>
          ),
          details: ({ children }) => <Contents>{children}</Contents>,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
