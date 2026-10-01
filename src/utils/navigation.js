export function navigate(href, replace = false) {
  window.history[replace ? "replaceState" : "pushState"]({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (!replace) window.scrollTo({ top: 0 });
}

export function updateParams(params, changes) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}
