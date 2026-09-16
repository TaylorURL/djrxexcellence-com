import { Component } from "react";
import Button from "@/components/ui/Button";

/**
 * Holds the page up when the view under it cannot render.
 *
 * A route is a chunk of its own, fetched when the visitor asks for it, and its
 * name carries a content hash that only the deploy which wrote it ever served.
 * A tab open across a release therefore asks for a file that has gone, and a
 * request lost on a weak connection ends the same way. Without a boundary that
 * rejection escapes Suspense and React unmounts the whole tree, which takes the
 * header and the footer with it and leaves the reader a white screen.
 *
 * The recovery is a fresh document: it arrives with the names the current
 * deploy is serving, so the page the visitor asked for loads on the way back.
 */
export default class PageError extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="page-shell py-28 text-center">
        <h1 className="font-display text-3xl font-semibold">
          This page did not finish loading
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Something went missing on the way over. Loading it again usually sorts
          it out.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button as="button" onClick={() => location.reload()}>
            Try Again
          </Button>
          <Button href="/" variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }
}
