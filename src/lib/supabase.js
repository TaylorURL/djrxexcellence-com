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

// A synchronous read of whatever the lazy import has already settled, for the
// one caller that cannot await: a public storage URL is built during render,
// from a row that only the client could have fetched, so by the time a path
// exists to turn into a URL the client behind it is loaded.
export function loadedClient() {
  return client;
}
