/**
 * Recovery from "stale build" errors.
 *
 * Each page's code lives in its own file whose name changes with every deploy (e.g. Blog-B8EMKGhJ.js).
 * A visitor who opened the site before a deploy still has the old page, which asks for the old file name —
 * and that file no longer exists. Instead of crashing, we reload once to pick up the new version.
 */

const RELOAD_KEY = 'odero_stale_reload_at';
const RELOAD_PARAM = '__v';

export const isStaleBuildError = (err: unknown): boolean => {
  const msg = String((err as any)?.message ?? err ?? '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk .* failed|Loading CSS chunk/i.test(
    msg
  );
};

/** Reload once (bypassing the cached page). Returns false if we already tried very recently. */
export const reloadForNewVersion = (): boolean => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 15_000) return false; // avoid reload loops
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage unavailable: still try once */
  }
  const url = new URL(window.location.href);
  url.searchParams.set(RELOAD_PARAM, String(Date.now())); // forces a fresh copy of the page, not the cached one
  window.location.replace(url.toString());
  return true;
};

/** Remove the cache-busting parameter from the address bar after a recovery reload. */
export const cleanReloadParam = () => {
  const url = new URL(window.location.href);
  if (url.searchParams.has(RELOAD_PARAM)) {
    url.searchParams.delete(RELOAD_PARAM);
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }
};

/** Wraps a dynamic import so a missing old file triggers a one-time reload instead of a crash. */
export const importWithRecovery = <T,>(loader: () => Promise<T>): Promise<T> =>
  loader().catch((err) => {
    if (isStaleBuildError(err) && reloadForNewVersion()) {
      return new Promise<T>(() => {}); // keep showing the loading state while the page reloads
    }
    throw err;
  });
