import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CornerDownRight, EyeOff, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { isConfigured } from "@/lib/supabase";
import {
  buildThread,
  deleteComment,
  fetchComments,
  postComment,
  setCommentHidden,
} from "@/services/comments";
import { relativeDate } from "@/lib/format";
import { agent } from "@/config/site";
import Button from "@/components/ui/Button";
import { textareaClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

function CommentForm({
  onSubmit,
  placeholder,
  submitLabel,
  onCancel,
  autoFocus,
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function handle(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await onSubmit(body.trim());
      setBody("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <label className="sr-only" htmlFor={`comment-${submitLabel}`}>
        {submitLabel}
      </label>
      <textarea
        id={`comment-${submitLabel}`}
        rows={3}
        value={body}
        autoFocus={autoFocus}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        className={textareaClasses}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !body.trim()}>
          {busy ? "Posting" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Comment({
  comment,
  depth,
  canModerate,
  userId,
  onReply,
  onDelete,
  onHide,
}) {
  const [replying, setReplying] = useState(false);
  const isAgentReply = comment.author_role === "agent";
  const mine = comment.author_id === userId;

  return (
    <li
      className={cn(
        "border-l-2 pl-4",
        isAgentReply ? "border-brand-red/40" : "border-surface-line",
        comment.is_hidden && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{comment.author_name || "Member"}</span>
        {isAgentReply ? (
          <span className="rounded-lg bg-brand-red/10 px-1.5 py-0.5 text-xs font-semibold text-brand-red">
            {agent.name.split(" ")[0]}
          </span>
        ) : null}
        <span className="text-ink-faint">
          {relativeDate(comment.created_at)}
        </span>
        {comment.is_hidden ? (
          <span className="text-xs font-semibold text-ink-faint">Hidden</span>
        ) : null}
      </div>

      <p className="mt-1.5 whitespace-pre-line leading-relaxed text-ink-muted">
        {comment.body}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
        {userId && depth < 3 ? (
          <button
            type="button"
            onClick={() => setReplying((value) => !value)}
            className="inline-flex items-center gap-1 text-ink-faint hover:text-brand-blue"
          >
            <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            Reply
          </button>
        ) : null}
        {canModerate ? (
          <button
            type="button"
            onClick={() => onHide(comment)}
            className="inline-flex items-center gap-1 text-ink-faint hover:text-brand-blue"
          >
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            {comment.is_hidden ? "Unhide" : "Hide"}
          </button>
        ) : null}
        {canModerate || mine ? (
          <button
            type="button"
            onClick={() => onDelete(comment)}
            className="inline-flex items-center gap-1 text-ink-faint hover:text-brand-red"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        ) : null}
      </div>

      {replying ? (
        <div className="mt-4">
          <CommentForm
            autoFocus
            submitLabel="Post Reply"
            placeholder={`Reply to ${comment.author_name || "this question"}`}
            onCancel={() => setReplying(false)}
            onSubmit={async (body) => {
              await onReply(comment.id, body);
              setReplying(false);
            }}
          />
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <ul className="mt-5 space-y-5">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              canModerate={canModerate}
              userId={userId}
              onReply={onReply}
              onDelete={onDelete}
              onHide={onHide}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function CommentThread({ listingId }) {
  const { user, isAgent } = useAuth();
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!isConfigured) return;
    fetchComments(listingId)
      .then(setComments)
      .catch(() => setComments([]));
  }, [listingId]);

  useEffect(load, [load]);

  const visible = isAgent
    ? comments
    : comments.filter(
        (comment) => !comment.is_hidden || comment.author_id === user?.id,
      );
  const thread = buildThread(visible);

  async function add(body, parentId = null) {
    setError("");
    try {
      await postComment({ listingId, authorId: user.id, body, parentId });
      load();
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onDelete(comment) {
    await deleteComment(comment.id);
    load();
  }

  async function onHide(comment) {
    await setCommentHidden(comment.id, !comment.is_hidden);
    load();
  }

  return (
    <section aria-labelledby="questions-heading">
      <h2
        id="questions-heading"
        className="font-display text-2xl font-semibold"
      >
        Questions About This Home
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Answers post here so the next person looking at this address can read
        them too.
      </p>

      {user ? (
        <div className="mt-5">
          <CommentForm
            submitLabel="Post Question"
            placeholder="Ask about the roof, the lot, the schools, anything."
            onSubmit={(body) => add(body)}
          />
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-surface-line bg-surface-raised p-4 text-sm text-ink-muted">
          <Link className="font-semibold text-brand-blue" to="/sign-in">
            Sign in
          </Link>{" "}
          to ask a question about this home.
        </p>
      )}

      {error ? (
        <p className="mt-4 text-sm font-medium text-brand-red">{error}</p>
      ) : null}

      {thread.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {thread.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              depth={0}
              canModerate={isAgent}
              userId={user?.id ?? null}
              onReply={(parentId, body) => add(body, parentId)}
              onDelete={onDelete}
              onHide={onHide}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-ink-muted">
          No questions on this listing yet.
        </p>
      )}
    </section>
  );
}
