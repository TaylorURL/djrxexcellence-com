import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { deleteComment, fetchCommentsByAuthor } from "@/services/comments";
import { relativeDate } from "@/lib/format";
import PageFallback from "@/components/PageFallback";
import AccountShell from "@/components/account/AccountShell";
import Button from "@/components/ui/Button";

export default function Questions() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommentsByAuthor(user.id)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  async function onDelete(id) {
    await deleteComment(id);
    setComments((rows) => rows.filter((row) => row.id !== id));
  }

  if (loading) return <PageFallback />;

  return (
    <AccountShell title="Your Questions">
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-8">
          <p className="text-ink-muted">
            You have not asked anything yet. Every listing page takes questions
            at the bottom.
          </p>
          <Button to="/listings" className="mt-5">
            Browse Listings
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="arrive rounded-2xl border border-surface-line p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  {comment.listings ? (
                    <Link
                      to={`/listings/${comment.listings.slug}`}
                      className="font-semibold text-ink hover:text-brand-red"
                    >
                      {comment.listings.street_address}, {comment.listings.city}
                    </Link>
                  ) : (
                    <p className="font-semibold text-ink-muted">
                      Listing no longer available
                    </p>
                  )}
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {comment.parent_id ? "Reply · " : ""}
                    {relativeDate(comment.created_at)}
                    {comment.is_hidden ? " · Hidden" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  aria-label="Delete Question"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-ink-faint hover:text-brand-red"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-muted">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
