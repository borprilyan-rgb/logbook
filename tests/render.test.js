import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";

test("home, entry, category, search, and missing routes render", async () => {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  const previousWindow = globalThis.window;
  try {
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    for (const [pathname, search, expected] of [
      ["/", "", "QS Knowledge Base"],
      ["/entry/concrete/slump", "", "Quick Answer"],
      ["/category/contract", "", "Contract entries"],
      ["/library", "?q=hydration", "Matched in"],
      ["/category/materials", "", "No knowledge entries found"],
      ["/knowledge/slump", "", "Quick Answer"],
      [
        "/library",
        "?project=Unknown",
        "No entries are associated with this project",
      ],
      ["/categories", "", "Fresh Concrete"],
      ["/topics", "", "Topics"],
      ["/projects", "", "Demo Project"],
      ["/glossary", "", "Bill of Quantities"],
      ["/bookmarks", "", "No bookmarked entries yet"],
      ["/needs-review", "", "Needs Review"],
      ["/missing", "", "Page not found"],
    ]) {
      globalThis.window = {
        location: { pathname, search, origin: "http://localhost" },
      };
      const html = renderToString(React.createElement(App));
      assert.ok(
        html.includes(expected),
        `${pathname}${search} should include ${expected}`,
      );
    }
    const { default: Markdown } = await server.ssrLoadModule(
      "/src/components/Markdown.jsx",
    );
    const body =
      "# Overview\n\n## Mix **design**\n\n## Mix design\n\n```md\n## Not a heading\n```\n\n| Test | Unit |\n| --- | --- |\n| Slump | mm |\n\n> [!WARNING]\n> Check the specification.\n\n> [!QS]\n> Check the pricing basis.\n\n---\n\n**Bold** and *italic* with `code`.\n";
    const rendered = renderToString(React.createElement(Markdown, { body }));
    assert.ok(rendered.includes("On this page"));
    assert.ok(rendered.includes('id="section-mix-design"'));
    assert.ok(rendered.includes('id="section-mix-design-2"'));
    assert.ok(!rendered.includes('href="#section-not-a-heading"'));
    assert.ok(rendered.includes("table-scroll"));
    assert.ok(rendered.includes("<table>"));
    assert.ok(rendered.includes("callout-warning"));
    assert.ok(rendered.includes("QS NOTE"));
    assert.ok(!rendered.includes("[!WARNING]"));
    assert.ok(rendered.includes("<hr/>"));
  } finally {
    globalThis.window = previousWindow;
    await server.close();
  }
});
