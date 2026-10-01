import { slugify } from "./knowledge.js";

function nodeText(node) {
  if (node.value) return node.value;
  if (node.type === "image") return node.alt || "";
  return (node.children || []).map(nodeText).join("");
}

// Work on the parsed Markdown tree: fenced code never becomes a false heading.
export function notebookMarkdown() {
  return (tree) => {
    const headings = [];
    const used = new Map();
    function visit(node) {
      if (node.type === "heading") {
        const label = nodeText(node);
        const base = slugify(label) || "section";
        const count = used.get(base) || 0;
        used.set(base, count + 1);
        const id = `section-${base}${count ? `-${count + 1}` : ""}`;
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id },
        };
        if (node.depth <= 3) headings.push({ label, id, depth: node.depth });
      }
      if (node.type === "blockquote") {
        const first = node.children?.[0];
        const marker = first?.children?.[0];
        const match =
          marker?.type === "text" &&
          marker.value.match(/^\[!(NOTE|WARNING|QS|EXAMPLE)\](?:\s|$)/);
        if (match) {
          marker.value = marker.value.slice(match[0].length);
          const type = match[1].toLowerCase();
          node.data = {
            ...node.data,
            hProperties: { className: `callout callout-${type}` },
          };
          node.children.unshift({
            type: "paragraph",
            data: { hProperties: { className: "callout-label" } },
            children: [
              { type: "text", value: type === "qs" ? "QS NOTE" : match[1] },
            ],
          });
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
    if (headings.length >= 3) {
      tree.children.unshift({
        type: "blockquote",
        data: { hName: "details", hProperties: { className: "toc" } },
        children: [
          {
            type: "paragraph",
            data: { hName: "summary" },
            children: [{ type: "text", value: "On this page" }],
          },
          {
            type: "list",
            ordered: false,
            children: headings.map((heading) => ({
              type: "listItem",
              data: {
                hProperties: { className: `toc-depth-${heading.depth}` },
              },
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "link",
                      url: `#${heading.id}`,
                      children: [{ type: "text", value: heading.label }],
                    },
                  ],
                },
              ],
            })),
          },
        ],
      });
    }
  };
}
