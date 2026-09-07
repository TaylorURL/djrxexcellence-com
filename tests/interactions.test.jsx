import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Lightbox from "@/components/listing/Lightbox";
import { CompareProvider, COMPARE_LIMIT } from "@/context/CompareProvider";
import { useCompare } from "@/hooks/useCompare";
import ShareBar from "@/components/listing/ShareBar";

const images = [
  { id: "1", url: "/a.jpg", alt: "Front" },
  { id: "2", url: "/b.jpg", alt: "Kitchen" },
  { id: "3", url: "/c.jpg", alt: "Yard" },
];

describe("Lightbox", () => {
  function setup(startIndex = 0) {
    const onIndexChange = vi.fn();
    const onClose = vi.fn();
    render(
      <Lightbox
        images={images}
        index={startIndex}
        onIndexChange={onIndexChange}
        onClose={onClose}
      />,
    );
    return { onIndexChange, onClose };
  }

  it("announces which photo is showing", () => {
    setup(1);
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Photo 2 of 3",
    );
  });

  it("steps forward and wraps at the end", () => {
    const { onIndexChange } = setup(2);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it("steps back and wraps at the start", () => {
    const { onIndexChange } = setup(0);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it("closes on escape", () => {
    const { onClose } = setup(0);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("gives the page its scroll back on unmount", () => {
    const { unmount } = render(
      <Lightbox
        images={images}
        index={0}
        onIndexChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  // A flex item defaults to min-height:auto, so without min-h-0 this row grows
  // to the photo rather than to its share of the column, and max-h-full then
  // measures against a box taller than the screen.
  it("bounds the photo row to its share of the screen", () => {
    setup();
    const photo = screen.getByAltText("Front");
    const row = photo.parentElement;
    expect(row.className).toContain("min-h-0");
    expect(row.className).toContain("flex-1");
  });

  it("fits the photo whole rather than cropping it", () => {
    setup();
    const photo = screen.getByAltText("Front");
    expect(photo.className).toContain("object-contain");
    expect(photo.className).toContain("max-h-full");
    expect(photo.className).toContain("max-w-full");
    expect(photo.className).not.toContain("object-cover");
    expect(photo.className).not.toContain("rounded");
  });
});

function CompareProbe() {
  const { ids, count, isFull, toggle } = useCompare();
  return (
    <div>
      <p data-testid="count">{count}</p>
      <p data-testid="ids">{ids.join(",")}</p>
      <p data-testid="full">{String(isFull)}</p>
      {["a", "b", "c", "d", "e"].map((id) => (
        <button key={id} type="button" onClick={() => toggle(id)}>
          {id}
        </button>
      ))}
    </div>
  );
}

describe("CompareProvider", () => {
  it("stops adding past the limit and lets an existing pick come back out", () => {
    window.localStorage.clear();
    render(
      <CompareProvider>
        <CompareProbe />
      </CompareProvider>,
    );

    ["a", "b", "c", "d", "e"].forEach((id) => {
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: id }));
      });
    });

    expect(screen.getByTestId("count").textContent).toBe(String(COMPARE_LIMIT));
    expect(screen.getByTestId("ids").textContent).toBe("a,b,c,d");
    expect(screen.getByTestId("full").textContent).toBe("true");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "b" }));
    });
    expect(screen.getByTestId("ids").textContent).toBe("a,c,d");
  });
});

describe("ShareBar", () => {
  it("offers every channel with the listing URL encoded", () => {
    render(
      <MemoryRouter>
        <ShareBar
          url="https://djrxexcellence.com/listings/123-oak"
          title="123 Oak St"
        />
      </MemoryRouter>,
    );

    const encoded = encodeURIComponent(
      "https://djrxexcellence.com/listings/123-oak",
    );
    ["Facebook", "X", "LinkedIn", "WhatsApp", "Text Message", "Email"].forEach(
      (label) => {
        const link = screen.getByRole("link", { name: `Share on ${label}` });
        expect(link.getAttribute("href")).toContain(encoded);
      },
    );
    expect(
      screen.getByRole("button", { name: /Copy Link/ }),
    ).toBeInTheDocument();
  });
});
