export const STORAGE_KEY = "fieldnotes.personal.v1";
export const emptyPersonal = () => ({ bookmarks: [], recent: [], views: {} });

export function readPersonal(storage, entries) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return emptyPersonal();
    const ids = new Map(
      entries.flatMap((entry) => [
        [entry.id, entry.id],
        [entry.legacyId, entry.id],
      ]),
    );
    const clean = (value) => [
      ...new Set(
        (Array.isArray(value) ? value : [])
          .filter((id) => typeof id === "string" && ids.has(id))
          .map((id) => ids.get(id)),
      ),
    ];
    const views = {};
    if (
      saved.views &&
      typeof saved.views === "object" &&
      !Array.isArray(saved.views)
    ) {
      for (const [id, count] of Object.entries(saved.views))
        if (ids.has(id) && Number.isSafeInteger(count) && count > 0)
          views[ids.get(id)] = count;
    }
    return {
      bookmarks: clean(saved.bookmarks),
      recent: clean(saved.recent).slice(0, 10),
      views,
    };
  } catch {
    return emptyPersonal();
  }
}

export function toggleBookmark(state, id) {
  return {
    ...state,
    bookmarks: state.bookmarks.includes(id)
      ? state.bookmarks.filter((item) => item !== id)
      : [...state.bookmarks, id],
  };
}

export function recordView(state, id) {
  const count = Number.isSafeInteger(state.views[id]) ? state.views[id] : 0;
  return {
    ...state,
    recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, 10),
    views: {
      ...state.views,
      [id]: Math.min(Number.MAX_SAFE_INTEGER, count + 1),
    },
  };
}

export function savePersonal(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
