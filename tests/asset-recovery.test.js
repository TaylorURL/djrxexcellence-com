import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The reporter in the document head decides what a failed `<link>` means, and
 * that decision is the whole of this fault: a dropped connection loses the
 * stylesheet and both module hints inside the same second, and the page used
 * to answer a build asset's `error` event by reloading itself and filing a
 * report, without ever asking whether the file was there. It is there - the
 * hashed names the reports carry are the ones the current document links. So
 * the reload throws away a page the reader was looking at and the report
 * describes a site that is correct.
 *
 * The script is inline, so the test runs the real one out of index.html rather
 * than a copy of it. `location` and `sessionStorage` are passed in as
 * parameters, which shadows the globals jsdom will not let a test replace.
 */
const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((body) => body.includes("window.__reporter"));

function start({ answers = true, drops = 0 } = {}) {
  const reloaded = vi.fn();
  const sent = [];
  const store = new Map();
  const listeners = [];
  const sessionStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
  const location = {
    href: "https://djrxexcellence.com/",
    search: "",
    reload: reloaded,
  };

  const fetches = [];
  let dropped = 0;
  window.fetch = vi.fn((url) => {
    fetches.push(String(url));
    if (dropped < drops) {
      dropped += 1;
      // What a dropped connection does: the request never reaches a server,
      // so there is no status to read and the promise rejects.
      return Promise.reject(new TypeError("Failed to fetch"));
    }
    return Promise.resolve({ ok: answers, status: answers ? 200 : 404 });
  });
  navigator.sendBeacon = vi.fn((endpoint, body) => {
    sent.push(JSON.parse(body));
    return true;
  });

  const add = window.addEventListener.bind(window);
  window.addEventListener = (type, handler, options) => {
    listeners.push([type, handler, options]);
    add(type, handler, options);
  };
  const addBare = globalThis.addEventListener;
  globalThis.addEventListener = window.addEventListener;

  new Function("location", "sessionStorage", source)(location, sessionStorage);

  window.addEventListener = add;
  globalThis.addEventListener = addBare;

  return {
    reloaded,
    sent,
    store,
    fetches,
    held: () => window.__reporter.replay(),
    stop: () => {
      for (const [type, handler, options] of listeners)
        window.removeEventListener(type, handler, options);
      document.head.querySelectorAll("link[data-test]").forEach((node) => {
        node.remove();
      });
    },
  };
}

function failed(rel, href) {
  const link = document.createElement("link");
  link.rel = rel;
  link.setAttribute("href", href);
  link.dataset.test = "1";
  document.head.appendChild(link);
  link.dispatchEvent(new Event("error", { bubbles: false, cancelable: true }));
  return link;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
// The asking backs off 300ms and then 600ms, so riding a lost second out
// takes a shade under a second of wall clock.
const rideItOut = () => new Promise((resolve) => setTimeout(resolve, 1400));

let session = null;

afterEach(() => {
  if (session) session.stop();
  session = null;
});

describe("a build asset that fails on a connection that then answers", () => {
  it("does not reload the page the reader is looking at", async () => {
    session = start({ answers: true });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await settle();
    expect(session.reloaded).not.toHaveBeenCalled();
  });

  it("files nothing, and keeps the drop on the page for the console", async () => {
    session = start({ answers: true });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await settle();
    expect(session.sent).toEqual([]);
    expect(
      session
        .held()
        .some((entry) => entry.message.includes("/assets/index-Cj-iSej8.css")),
    ).toBe(true);
  });

  it("asks for the file before deciding anything about it", async () => {
    session = start({ answers: true });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await settle();
    expect(session.fetches).toEqual([
      "http://localhost:3000/assets/index-Cj-iSej8.css",
    ]);
  });

  it("treats a dropped module hint the same way", async () => {
    session = start({ answers: true });
    failed("modulepreload", "/assets/react-AaNUmKY_.js");
    await settle();
    expect(session.reloaded).not.toHaveBeenCalled();
    expect(session.sent).toEqual([]);
  });
});

describe("a build asset that is genuinely gone", () => {
  it("still reloads onto the current document, once", async () => {
    session = start({ answers: false });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await settle();
    expect(session.reloaded).toHaveBeenCalledTimes(1);
    expect(session.store.get("dj-stale-reload")).toBe("1");
  });

  it("still files when the reload has already been spent", async () => {
    session = start({ answers: false });
    session.store.set("dj-stale-reload", "1");
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await settle();
    expect(session.reloaded).not.toHaveBeenCalled();
    expect(session.sent.map((report) => report.message)).toEqual([
      "Failed to load link: http://localhost:3000/assets/index-Cj-iSej8.css",
    ]);
  });
});

describe("the one reload a visitor gets", () => {
  it("is given back by a load that needed no recovery", () => {
    session = start();
    session.store.set("dj-stale-reload", "1");
    window.dispatchEvent(new Event("load"));
    expect(session.store.has("dj-stale-reload")).toBe(false);
  });

  it("is not given back by a load that lost a file", async () => {
    session = start({ answers: false });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    window.dispatchEvent(new Event("load"));
    await settle();
    expect(session.store.get("dj-stale-reload")).toBe("1");
  });
});

/**
 * The connection itself dropping is the case these reports have always been,
 * and it is the one case the eight tests above never put the reporter in: all
 * of them answer the asking, with a 200 or with a 404. A dropped connection
 * answers neither. It fails the asking for the very reason it failed the
 * element's own load, so a reporter that reads a silence as a 404 falls
 * straight back onto the behaviour the asking was added to replace - reload
 * the page the reader is looking at, then file a report naming a file that is
 * present and answering.
 */
describe("a lost second rather than a lost file", () => {
  it("does not call a file gone because the asking went unanswered", async () => {
    session = start({ drops: 99 });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await settle();
    expect(session.reloaded).not.toHaveBeenCalled();
    expect(session.sent).toEqual([]);
  });

  it("asks again, on a backoff, rather than once", async () => {
    session = start({ drops: 99 });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await rideItOut();
    expect(session.fetches).toHaveLength(3);
  });

  it("rides the drop out and keeps the page, when the file comes back", async () => {
    session = start({ drops: 1, answers: true });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await rideItOut();
    expect(session.reloaded).not.toHaveBeenCalled();
    expect(session.sent).toEqual([]);
  });

  it("puts the stylesheet back on the page rather than only logging it", async () => {
    session = start({ drops: 1, answers: true });
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await rideItOut();
    const back = document.head.querySelector("link[data-dj-refit]");
    expect(back).not.toBeNull();
    expect(back.getAttribute("href")).toBe("/assets/index-Cj-iSej8.css");
  });

  it("gives the one reload back after a drop it recovered from", async () => {
    session = start({ drops: 1, answers: true });
    session.store.set("dj-stale-reload", "1");
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    window.dispatchEvent(new Event("load"));
    await rideItOut();
    expect(session.store.has("dj-stale-reload")).toBe(false);
  });

  it("still files, once the asking is spent and the file never came", async () => {
    session = start({ drops: 99 });
    session.store.set("dj-stale-reload", "1");
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await rideItOut();
    expect(session.sent.map((report) => report.message)).toEqual([
      "Failed to load link: http://localhost:3000/assets/index-Cj-iSej8.css",
    ]);
  });

  it("does not spend the three links' worth of reports on one lost second", async () => {
    session = start({ drops: 1, answers: true });
    failed("modulepreload", "/assets/index-BZXaTmr-.js");
    failed("modulepreload", "/assets/react-AaNUmKY_.js");
    failed("stylesheet", "/assets/index-Cj-iSej8.css");
    await rideItOut();
    expect(session.reloaded).not.toHaveBeenCalled();
    expect(session.sent).toEqual([]);
  });
});
