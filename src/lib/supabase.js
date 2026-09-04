const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

// The client is the largest single module the site ships and nothing above the
// fold reads it: every call it serves is made from an effect, after the first
// frame is already on screen. Imported at the top of a module the entry chunk
// reaches, it became a modulepreload on the critical path, so the browser
// fetched, parsed and evaluated the whole SDK before React could mount. It is
// imported on first use instead, which leaves the entry graph with this file's
// two environment reads and nothing else.
let client = null;
let pending = null;

// A screen that brings the client into existence is not always the screen that
// needs to hear about the session it restores: signing in happens on one route
// and the header that has to notice mounted long before it. Whoever needs the
// instance the moment it exists waits here rather than fetching the SDK to be
// sure of getting one.
const waiting = new Set();

export function onClientReady(callback) {
  if (client) {
    callback(client);
    return () => {};
  }
  waiting.add(callback);
  return () => waiting.delete(callback);
}

export async function getClient() {
  if (client) return client;
  if (!isConfigured) return null;
  if (!pending) {
    pending = import("@supabase/supabase-js").then(({ createClient }) => {
      client = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      for (const callback of [...waiting]) {
        waiting.delete(callback);
        callback(client);
      }
      return client;
    });
  }
  return pending;
}

export async function requireClient() {
  const instance = await getClient();
  if (!instance) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  return instance;
}

// The client persists a session under this key, and a sign-in that is still
// mid-callback leaves its verifier beside it. A visitor holding neither, which
// is nearly everyone arriving on the landing page, has no session for the
// client to restore -- and the SDK was being downloaded, parsed and evaluated
// on the main thread to establish exactly that.
const sessionKey = `sb-${String(url).split("//")[1]?.split(".")[0]}-auth-token`;

export function mayHaveSession() {
  if (!isConfigured) return false;
  try {
    if (window.localStorage.getItem(sessionKey)) return true;
    if (window.localStorage.getItem(`${sessionKey}-code-verifier`)) return true;
  } catch {
    /* a private window refuses storage, and refuses to persist a session too */
  }
  // A confirmation or recovery link hands the tokens over in the fragment, so
  // the client has to be there to read them before the browser drops it.
  return window.location.hash.includes("access_token=");
}

// A read of a published row is a GET, and PostgREST is what answers it. The
// query builder that phrases it is one part of a client that also carries auth,
// realtime and storage, so loading the SDK to ask for six listings charged the
// landing page for all four. The two anonymous reads it makes are issued
// directly instead, and the SDK is left to the session and to every write.
export async function selectFrom(table, params, { count = false } = {}) {
  if (!isConfigured) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
  if (count) headers.Prefer = "count=exact";

  const query = new URLSearchParams(params);
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Reading ${table} failed with ${response.status}: ${detail.slice(0, 200)}`,
    );
  }

  const rows = await response.json();
  // The header reads `0-11/57`, and carries `*` for the range when nothing was
  // paged. Absent it, the page in hand is the whole answer.
  const total = Number(response.headers.get("content-range")?.split("/")[1]);
  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

// The storage URL of a public object is a path, not a lookup, so it is written
// out rather than asked for. It used to come from whichever client happened to
// have loaded, which meant a cover photo resolved to nothing on any render that
// beat the SDK.
export function publicStorageUrl(bucket, path) {
  if (!isConfigured || !path) return null;
  return encodeURI(`${url}/storage/v1/object/public/${bucket}/${path}`);
}
