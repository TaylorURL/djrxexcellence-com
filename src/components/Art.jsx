import { useEffect, useRef, useState } from "react";

/** How long to wait before asking for the file again. */
const RETRY_MS = 800;

/** How many times to ask again before giving the space back. */
const RETRIES = 1;

/**
 * An illustration the page draws alongside its text. It stands for nothing a
 * reader has to have, so it carries an empty alt and is hidden from assistive
 * technology, and losing one costs the page decoration rather than meaning.
 *
 * It is still worth asking twice. A connection that drops mid-load fails every
 * request in flight on it at the same moment, so a page loses its whole set of
 * illustrations over one bad second rather than one of them. A plain `img`
 * never asks again, and the reader is then left looking at empty squares for
 * the rest of the visit even though the files came back a moment later. One
 * retry, on a fresh URL so the browser's record of the failure is not reused,
 * recovers the page; a second failure takes the element out so the layout
 * closes over the gap instead of holding an empty box open.
 */
export default function Art({ src, className, width, height, loading }) {
  const [attempt, setAttempt] = useState(0);
  const [gone, setGone] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (gone) return null;

  function askAgain() {
    if (attempt >= RETRIES) {
      setGone(true);
      return;
    }
    timer.current = setTimeout(
      () => setAttempt((count) => count + 1),
      RETRY_MS,
    );
  }

  return (
    <img
      key={attempt}
      src={attempt === 0 ? src : `${src}?retry=${attempt}`}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      loading={loading}
      onError={askAgain}
      className={className}
    />
  );
}
