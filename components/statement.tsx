import Markdown from "react-markdown";

/**
 * Renders a problem statement written in Markdown. Raw HTML in the source is
 * not rendered, so statements are safe to display as-is. Typography lives in
 * the `.statement` rules in globals.css.
 */
export function Statement({ markdown }: { markdown: string }) {
  return (
    <div className="statement">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}
