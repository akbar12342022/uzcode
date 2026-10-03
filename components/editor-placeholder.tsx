/** Shown in the editor area while the code editor is downloading. */
export function EditorPlaceholder() {
  return (
    <div
      role="status"
      className="flex h-full w-full items-center justify-center bg-surface font-mono text-sm text-muted"
    >
      Muharrir yuklanmoqda…
    </div>
  );
}
