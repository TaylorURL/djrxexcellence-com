import { useEffect, useRef } from "react";

/**
 * What the page does at the cursor when it is clicked.
 *
 * Press feedback answers for the control that was hit; this answers for the
 * click, wherever it lands. A single hairline ring expanding from the pointer
 * suits a page whose voice is a survey rather than a product launch.
 *
 * The ring is drawn on a fixed layer of its own so no `overflow: hidden`
 * ancestor can clip it, and the layer never takes a pointer event, so nothing
 * underneath it stops being clickable.
 */
export default function ClickSpark() {
  const layer = useRef(null);

  useEffect(() => {
    const node = layer.current;
    if (!node) return undefined;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    function onPointerDown(event) {
      if (still.matches || event.button !== 0) return;
      const ring = document.createElement("span");
      ring.className = "click-ring rounded-full";
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      ring.addEventListener("animationend", () => ring.remove());
      node.appendChild(ring);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="click-layer pointer-events-none fixed inset-0 z-effect"
    />
  );
}
