import React from "react";
import { knowledgeRepository as repository } from "../data/knowledgeRepository.js";
import { statuses, difficulties, importances } from "../utils/knowledge.js";

export const filterKeys = [
  "category",
  "subcategory",
  "tag",
  "status",
  "difficulty",
  "importance",
  "project",
];
export default function Filters({ params, onChange, fixedCategory }) {
  const fields = [
    [
      "category",
      "Category",
      repository.getCategories().map((item) => item.name),
    ],
    [
      "subcategory",
      "Subcategory",
      repository.getSubcategories().map((item) => item.name),
    ],
    ["tag", "Tag", repository.getTags().map((item) => item.name)],
    ["status", "Status", statuses],
    ["difficulty", "Difficulty", difficulties],
    ["importance", "Importance", importances],
    ["project", "Project", repository.getProjects().map((item) => item.name)],
  ];
  return (
    <div className="filters">
      <div className="filter-heading">
        <span>FILTER KNOWLEDGE</span>
        <button
          className="text-button"
          onClick={() =>
            onChange(Object.fromEntries(filterKeys.map((key) => [key, ""])))
          }
        >
          Reset filters
        </button>
      </div>
      <div className="filter-grid">
        {fields.map(([key, label, options]) => (
          <label key={key}>
            {label}
            <select
              value={
                key === "category" && fixedCategory
                  ? fixedCategory
                  : params.get(key) || ""
              }
              disabled={key === "category" && !!fixedCategory}
              onChange={(event) => onChange({ [key]: event.target.value })}
            >
              <option value="">
                All{" "}
                {label.toLowerCase() === "category"
                  ? "categories"
                  : label.toLowerCase() === "difficulty"
                    ? "levels"
                    : label.toLowerCase() === "status"
                      ? "statuses"
                      : label.toLowerCase() + "s"}
              </option>
              {[
                ...new Set(
                  [
                    ...options,
                    params.get(key),
                    key === "category" ? fixedCategory : "",
                  ].filter(Boolean),
                ),
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}
