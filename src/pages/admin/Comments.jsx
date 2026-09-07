import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import {
  deleteComment,
  fetchAllComments,
  setCommentHidden,
} from "@/services/comments";
import { relativeDate } from "@/lib/format";
import PageFallback from "@/components/app/PageFallback";
import AdminShell from "@/components/admin/AdminShell";
import { cn } from "@/lib/cn";

const scopes = [
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "all", label: "All" },
];

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("visible");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllComments()
      .then(setComments)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    if (scope === "visible")
      return comments.filter((comment) => !comment.is_hidden);
    if (scope === "hidden")
      return comments.filter((comment) => comment.is_hidden);
    return comments;
  }, [comments, scope]);

  async function toggleHidden(comment) {
    setError("");
    try {
      const updated = await setCommentHidden(comment.id, !comment.is_hidden);
      setComments((rows) =>
        rows.map((row) =>
          row.id === comment.id
            ? { ...row, is_hidden: updated.is_hidden }
            : row,
        ),
      );
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onDelete(comment) {
    const confirmed = window.confirm(
      "Delete this comment? Replies to it go with it.",
    );
    if (!confirmed) return;
    try {
      await deleteComment(comment.id);
      setComments((rows) => rows.filter((row) => row.id !== comment.id));
    } catch (caught) {
      setError(caught.message);
    }
  }

  if (loading) return <PageFallback />;

  return (
    <AdminShell title="Comments">
      {error ? (
        <p className="mb-4 rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 text-sm font-medium text-brand-red">
          {error}
        </p>
      ) : null}

      <div
        role="group"
        aria-label="Comment Scope"
        className="mb-6 inline-flex rounded-xl border border-surface-line bg-surface p-1"
      >
        {scopes.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setScope(option.value)}
            aria-pressed={scope === option.value}
            className={cn(
              "h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors duration-fast ease-out",
              scope === option.value
                ? "bg-brand-blue text-white"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-surface-line bg-surface-raised p-8 text-ink-muted">
          Nothing in this view.
        </p>
      ) : (
        <ul className="space-y-4">
          {shown.map((comment) => (
            <li
              key={comment.id}
              className={cn(
                "arrive rounded-2xl border border-surface-line p-5",
                comment.is_hidden && "bg-surface-raised opacity-75",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {comment.author_name || "Member"}
                    {comment.author_role === "agent" ? (
                      <span className="ml-2 rounded-lg bg-brand-red/10 px-1.5 py-0.5 text-xs font-semibold text-brand-red">
                        Agent
                      </span>
                    ) : null}
                    {comment.parent_id ? (
                      <span className="ml-2 text-xs font-normal text-ink-faint">
                        Reply
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {relativeDate(comment.created_at)}
                    {comment.listings ? " · " : ""}
                    {comment.listings ? (
                      <Link
                        className="font-semibold hover:text-ink"
                        to={`/listings/${comment.listings.slug}`}
                      >
                        {comment.listings.street_address}
                      </Link>
                    ) : null}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleHidden(comment)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-surface-line px-3 text-sm font-semibold text-ink-muted hover:text-ink"
                  >
                    {comment.is_hidden ? (
                      <>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Unhide
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                        Hide
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(comment)}
                    aria-label="Delete Comment"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-ink-faint hover:text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-muted">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
