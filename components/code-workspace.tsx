"use client";

import Editor, {
  type OnChange,
  type OnMount,
} from "@monaco-editor/react";
import { LoaderCircle, Play, RotateCcw, Send } from "lucide-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { runCode, submitCode } from "@/app/problems/actions";
import "@/components/monaco-config";
import { EditorPlaceholder } from "@/components/editor-placeholder";
import { JudgePanel, type JudgeState } from "@/components/judge-panel";
import {
  EDITOR_FONT_SIZE,
  EDITOR_OPTIONS,
  EDITOR_THEME,
  defineEditorTheme,
} from "@/lib/editor-theme";
import { plexMono } from "@/lib/fonts";
import type { JudgeMode, JudgeResponse } from "@/lib/judge-types";
import {
  LANGUAGES,
  isLanguageId,
  type LanguageId,
  type StarterCode,
} from "@/lib/languages";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Persistence — code is kept per problem and language in localStorage.
// Storage can be unavailable (private mode, quota), so it is best-effort.
// ---------------------------------------------------------------------------

const LANGUAGE_KEY = "uzcode:language";

function codeKey(slug: string, languageId: LanguageId) {
  return `uzcode:code:${slug}:${languageId}`;
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the code simply won't survive a reload.
  }
}

/** The user's saved code, or null when there is none worth restoring. */
function readSavedCode(slug: string, languageId: LanguageId, starter: string) {
  const saved = readStorage(codeKey(slug, languageId));
  return saved !== null && saved !== starter ? saved : null;
}

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

type CodeWorkspaceProps = {
  slug: string;
  starterCode: StarterCode;
};

export function CodeWorkspace({ slug, starterCode }: CodeWorkspaceProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const [languageId, setLanguageId] = useState<LanguageId>(() => {
    const stored = readStorage(LANGUAGE_KEY);
    return isLanguageId(stored) ? stored : LANGUAGES[0].id;
  });
  const language =
    LANGUAGES.find(({ id }) => id === languageId) ?? LANGUAGES[0];
  const starter = starterCode[language.id] ?? "";

  // Monaco reads this only when it creates the model for a language, so one
  // read per problem and language is enough.
  const initialCode = useMemo(
    () => readSavedCode(slug, language.id, starter) ?? starter,
    [slug, language.id, starter],
  );

  // Whether the editor holds anything other than the starter code.
  const [dirty, setDirty] = useState(initialCode !== starter);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const [editorReady, setEditorReady] = useState(false);
  const [judgeState, setJudgeState] = useState<JudgeState | null>(null);
  // Identifies the latest run, so a reply to an abandoned one is ignored.
  const latestRun = useRef(0);
  const judging = judgeState?.status === "pending";

  function dismissJudge() {
    latestRun.current++;
    setJudgeState(null);
  }

  function selectLanguage(next: LanguageId) {
    setLanguageId(next);
    setDirty(readSavedCode(slug, next, starterCode[next] ?? "") !== null);
    setConfirmingReset(false);
    dismissJudge(); // a result belongs to the language it was produced with
    writeStorage(LANGUAGE_KEY, next);
  }

  async function startJudge(mode: JudgeMode) {
    const run = ++latestRun.current;
    setJudgeState({ status: "pending", mode });

    let response: JudgeResponse;
    try {
      const input = {
        slug,
        language: language.id,
        code: editorRef.current?.getValue() ?? "",
      };
      response = await (mode === "run" ? runCode(input) : submitCode(input));
    } catch {
      response = {
        ok: false,
        message:
          "Server bilan bog'lanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.",
      };
    }

    if (run === latestRun.current) {
      setJudgeState({ status: "done", mode, response });
    }
  }

  const handleChange = useCallback<OnChange>(
    (value) => {
      const code = value ?? "";
      const changed = code !== starter;
      // Untouched starter code is not stored, so an updated starter still
      // reaches people who never edited the old one.
      writeStorage(codeKey(slug, language.id), changed ? code : null);
      setDirty(changed);
      if (!changed) setConfirmingReset(false);
    },
    [slug, language.id, starter],
  );

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorReady(true);
    // Monaco measures glyph widths as it starts. If the webfont arrives later
    // the cursor drifts, so measure again once the font is ready.
    document.fonts
      .load(`${EDITOR_FONT_SIZE}px ${plexMono.style.fontFamily}`)
      .then(() => monaco.editor.remeasureFonts())
      .catch(() => {});
  };

  function resetCode() {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!editor || !model) return;

    // Applied as an edit so Ctrl+Z brings the previous code back.
    editor.pushUndoStop();
    editor.executeEdits("reset", [
      { range: model.getFullModelRange(), text: starter, forceMoveMarkers: true },
    ]);
    editor.pushUndoStop();
    editor.focus();
    setConfirmingReset(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-3 py-2">
        <div
          role="radiogroup"
          aria-label="Dasturlash tili"
          className="flex items-center gap-1"
        >
          {LANGUAGES.map(({ id, label }) => (
            <label
              key={id}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
                id === language.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-raised hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="language"
                value={id}
                checked={id === language.id}
                onChange={() => selectLanguage(id)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>

        {confirmingReset ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{"Yozgan kodingiz o'chadi."}</span>
            <button
              type="button"
              onClick={resetCode}
              className="font-medium text-fail hover:underline"
            >
              Qaytarish
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="font-medium text-muted hover:text-ink"
            >
              Bekor qilish
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!dirty}
            onClick={() => setConfirmingReset(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw aria-hidden className="size-4" />
            <span className="sr-only sm:not-sr-only">Asl holiga qaytarish</span>
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <Editor
            path={`${slug}/${language.file}`}
            defaultLanguage={language.monaco}
            defaultValue={initialCode}
            theme={EDITOR_THEME}
            options={EDITOR_OPTIONS}
            loading={<EditorPlaceholder />}
            beforeMount={defineEditorTheme}
            onMount={handleMount}
            onChange={handleChange}
          />
        </div>
      </div>

      {judgeState && <JudgePanel state={judgeState} onClose={dismissJudge} />}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-3 py-2.5">
        <p className="text-xs text-muted">Kod shu brauzerda saqlanadi.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!editorReady || judging}
            onClick={() => startJudge("run")}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-raised disabled:pointer-events-none disabled:opacity-50"
          >
            {judging && judgeState.mode === "run" ? (
              <LoaderCircle
                aria-hidden
                className="size-4 motion-safe:animate-spin"
              />
            ) : (
              <Play aria-hidden className="size-4" />
            )}
            Ishga tushirish
          </button>
          <button
            type="button"
            disabled={!editorReady || judging}
            onClick={() => startJudge("submit")}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {judging && judgeState.mode === "submit" ? (
              <LoaderCircle
                aria-hidden
                className="size-4 motion-safe:animate-spin"
              />
            ) : (
              <Send aria-hidden className="size-4" />
            )}
            Yuborish
          </button>
        </div>
      </div>
    </div>
  );
}
