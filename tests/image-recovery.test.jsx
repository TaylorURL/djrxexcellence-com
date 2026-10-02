import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import Art from "@/components/Art";
import AgentPortrait from "@/components/AgentPortrait";
import { agent } from "@/config/site";

// A connection that drops mid-load fails every request in flight on it at the
// same moment, so a page loses its whole set of illustrations over one bad
// second. The browser's `error` event is the same event a missing file raises
// and the page cannot tell them apart, so it asks once more before it accepts
// the loss.
beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

function settle(ms = 1000) {
  act(() => vi.advanceTimersByTime(ms));
}

describe("an illustration whose request was dropped", () => {
  it("asks again, on a URL the browser has no failure recorded against", () => {
    const { container } = render(<Art src="/art/key.svg" width={72} />);

    fireEvent.error(container.querySelector("img"));
    settle();

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/art/key.svg?retry=1",
    );
  });

  it("gives the space back rather than holding an empty box open", () => {
    const { container } = render(<Art src="/art/map.svg" width={72} />);

    fireEvent.error(container.querySelector("img"));
    settle();
    fireEvent.error(container.querySelector("img"));
    settle();

    expect(container.querySelector("img")).toBeNull();
  });

  it("leaves the first request alone, so nothing is fetched twice", () => {
    const { container } = render(<Art src="/art/calendar.svg" width={72} />);

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/art/calendar.svg",
    );
  });
});

describe("a portrait whose request was dropped", () => {
  it("asks again before it falls back to the monogram", () => {
    const { container } = render(<AgentPortrait priority />);

    fireEvent.error(container.querySelector("img"));
    settle();

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", `${agent.headshot}?retry=1`);
    expect(container.querySelector("source").getAttribute("srcSet")).toContain(
      "?retry=1",
    );
  });

  it("falls back to the monogram once the second ask fails too", () => {
    const { container } = render(<AgentPortrait priority />);

    fireEvent.error(container.querySelector("img"));
    settle();
    fireEvent.error(container.querySelector("img"));
    settle();

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[role="img"]')).toHaveAttribute(
      "aria-label",
      agent.name,
    );
  });

  it("asks for the preloaded candidate first, so the hero is not fetched twice", () => {
    const { container } = render(<AgentPortrait priority />);

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      agent.headshot,
    );
    expect(
      container.querySelector("source").getAttribute("srcSet"),
    ).not.toContain("?retry=");
  });
});
