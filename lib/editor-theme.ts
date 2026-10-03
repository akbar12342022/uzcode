import type { BeforeMount, EditorProps } from "@monaco-editor/react";
import { plexMono } from "@/lib/fonts";

export const EDITOR_FONT_SIZE = 14;

/** Registered by `defineEditorTheme` and passed to every Monaco instance. */
export const EDITOR_THEME = "uzcode";

export const EDITOR_OPTIONS: NonNullable<EditorProps["options"]> = {
  ariaLabel: "Kod muharriri",
  fontFamily: plexMono.style.fontFamily,
  fontSize: EDITOR_FONT_SIZE,
  lineHeight: 22,
  tabSize: 2,
  minimap: { enabled: false },
  wordWrap: "on",
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  overviewRulerLanes: 0,
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
  fixedOverflowWidgets: true,
};

/**
 * One dark theme, matching the site tokens in `globals.css`. Syntax keeps to
 * three hues — lojuvard keywords, teal strings, amber numbers — so the editor
 * never shouts louder than a test verdict sitting next to it. Monaco needs
 * literal hex values, so these are duplicated from the CSS tokens by hand.
 */
export const defineEditorTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(EDITOR_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5f717c", fontStyle: "italic" },
      { token: "keyword", foreground: "8a97ff" },
      { token: "string", foreground: "5fb59b" },
      { token: "number", foreground: "d9a441" },
      { token: "type", foreground: "e4eaee" },
    ],
    colors: {
      "editor.background": "#121a1f",
      "editor.foreground": "#e4eaee",
      "editorLineNumber.foreground": "#44565f",
      "editorLineNumber.activeForeground": "#9aabb6",
      "editor.lineHighlightBackground": "#19242b",
      "editor.selectionBackground": "#2b3a63",
      "editorCursor.foreground": "#6d7bf5",
      "editorIndentGuide.background1": "#1e2a32",
      "editorIndentGuide.activeBackground1": "#33454f",
      "editorWidget.background": "#19242b",
      "editorWidget.border": "#30434f",
    },
  });
};
