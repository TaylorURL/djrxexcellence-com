import { useState } from "react";
import {
  Check,
  Facebook,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";

export default function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const message = encodeURIComponent(`${title} ${url}`);

  const targets = [
    {
      label: "Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "LinkedIn",
      Icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      Icon: MessageCircle,
      href: `https://wa.me/?text=${message}`,
    },
    {
      label: "Text Message",
      Icon: Send,
      href: `sms:?&body=${message}`,
    },
    {
      label: "Email",
      Icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${message}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  async function share() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* the visitor dismissed the share sheet */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== "undefined" && navigator.share ? (
        <button
          type="button"
          onClick={share}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-surface-line px-3 text-sm font-semibold text-ink-muted transition-colors duration-fast ease-out hover:border-brand-blue hover:text-brand-blue sm:hidden"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </button>
      ) : null}

      {targets.map(({ label, Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          title={label}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-ink-muted transition-colors duration-fast ease-out hover:border-brand-blue hover:text-brand-blue"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}

      <button
        type="button"
        onClick={copy}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-surface-line px-3 text-sm font-semibold text-ink-muted transition-colors duration-fast ease-out hover:border-brand-blue hover:text-brand-blue"
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy Link"}
      </button>
    </div>
  );
}
