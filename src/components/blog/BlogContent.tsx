import { useMemo } from "react";
import DOMPurify from "dompurify";

// Harden every surviving anchor: open in a new tab without leaking the opener.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

/**
 * Renders trusted-but-untrusted blog HTML. The markup is produced by the admin
 * rich-text editor and stored server-side, but it is always sanitized here
 * before it touches the DOM so a compromised draft cannot inject script/handlers.
 */
export default function BlogContent({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html ?? "", {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target", "rel"],
        FORBID_TAGS: ["style"],
        FORBID_ATTR: ["style"],
      }),
    [html],
  );

  return (
    <div className={className ? `blog-content ${className}` : "blog-content"} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
