"use client";

import { LoaderCircle, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import "@/components/monaco-config";
import { EditorPlaceholder } from "@/components/editor-placeholder";
import { type CellState, TestCells } from "@/components/test-cells";
import {
  EDITOR_OPTIONS,
  EDITOR_THEME,
  defineEditorTheme,
} from "@/lib/editor-theme";

// Monaco is a large download and the page must paint before it arrives.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false, loading: () => <EditorPlaceholder /> },
);

const STARTER = `function twoSum(nums, target) {
  // nums ichidan yig'indisi target ga teng bo'lgan
  // ikki sonning indekslarini qaytaring.
}
`;

const TESTS = [
  { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
  { nums: [3, 2, 4], target: 6, expected: [1, 2] },
  { nums: [3, 3], target: 6, expected: [0, 1] },
  { nums: [-1, -2, -3, -4, -5], target: -8, expected: [2, 4] },
  { nums: [0, 4, 3, 0], target: 0, expected: [0, 3] },
] as const;

const TIME_LIMIT_MS = 2500;

/* The demo never reaches the judge service: the visitor's code runs in a Web
   Worker in their own browser, so the page costs nothing to serve and works
   before anyone has signed up. A worker also means an endless loop can be
   terminated instead of freezing the page. Inside the app, solutions go to
   the real judge, where every language is available. */
const WORKER_SOURCE = `
self.onmessage = function (event) {
  var source = event.data.source;
  var tests = event.data.tests;
  var solve;

  try {
    solve = new Function(source + "\\nreturn typeof twoSum === 'function' ? twoSum : null;")();
  } catch (error) {
    self.postMessage({ kind: "error", message: readMessage(error) });
    return;
  }

  if (typeof solve !== "function") {
    self.postMessage({ kind: "error", message: "twoSum nomli funksiya topilmadi." });
    return;
  }

  var results = [];
  for (var index = 0; index < tests.length; index++) {
    var test = tests[index];
    try {
      var got = solve(test.nums.slice(), test.target);
      results.push({ ok: matches(got, test.expected), got: show(got) });
    } catch (error) {
      results.push({ ok: false, got: "xato: " + readMessage(error) });
    }
  }
  self.postMessage({ kind: "done", results: results });
};

function readMessage(error) {
  return String(error && error.message ? error.message : error);
}

function show(value) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function matches(got, expected) {
  if (!Array.isArray(got) || got.length !== expected.length) return false;
  var ascending = function (a, b) { return a - b; };
  var mine = got.map(Number).sort(ascending);
  var want = expected.slice().sort(ascending);
  for (var index = 0; index < mine.length; index++) {
    if (mine[index] !== want[index]) return false;
  }
  return true;
}
`;

type TestResult = { ok: boolean; got: string };
type Status = "idle" | "running" | "done" | "error" | "timeout";

export function HomeDemo() {
  const codeRef = useRef(STARTER);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<number | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const stop = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const run = useCallback(() => {
    stop();
    setStatus("running");
    setResults(null);
    setMessage(null);

    const url = URL.createObjectURL(
      new Blob([WORKER_SOURCE], { type: "text/javascript" }),
    );
    const worker = new Worker(url);
    workerRef.current = worker;

    const finish = () => {
      URL.revokeObjectURL(url);
      stop();
    };

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | { kind: "error"; message: string }
        | { kind: "done"; results: TestResult[] };
      finish();
      if (data.kind === "error") {
        setStatus("error");
        setMessage(data.message);
        return;
      }
      setResults(data.results);
      setStatus("done");
    };

    worker.onerror = () => {
      finish();
      setStatus("error");
      setMessage("Kodni ishga tushirib bo'lmadi.");
    };

    timerRef.current = window.setTimeout(() => {
      finish();
      setStatus("timeout");
    }, TIME_LIMIT_MS);

    worker.postMessage({ source: codeRef.current, tests: TESTS });
  }, [stop]);

  const cells: CellState[] | null =
    results?.map((result) => (result.ok ? "ok" : "fail")) ?? null;
  const passed = results?.filter((result) => result.ok).length ?? 0;
  const firstFailure = results?.findIndex((result) => !result.ok) ?? -1;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="font-mono text-sm text-ink">twoSum.js</p>
        <p className="text-xs text-muted">Brauzeringizda ishlaydi</p>
      </div>

      <div className="border-b border-line px-4 py-3.5">
        <p className="text-sm leading-relaxed text-ink-dim">
          {
            "Butun sonlar ro'yxati va nishon son berilgan. Yig'indisi nishonga teng bo'lgan ikki sonning indekslarini qaytaring."
          }
        </p>
        <p className="mt-2 font-mono text-xs text-muted">
          nums = [2, 7, 11, 15], target = 9 → [0, 1]
        </p>
      </div>

      <div className="h-[11rem] sm:h-[12.5rem]">
        <MonacoEditor
          defaultLanguage="javascript"
          defaultValue={STARTER}
          theme={EDITOR_THEME}
          options={{ ...EDITOR_OPTIONS, ariaLabel: "Namuna kod muharriri" }}
          loading={<EditorPlaceholder />}
          beforeMount={defineEditorTheme}
          onChange={(value) => {
            codeRef.current = value ?? "";
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <TestCells total={TESTS.length} results={cells} />
          <p
            aria-live="polite"
            className="text-sm text-muted"
          >
            {status === "idle" && `${TESTS.length} ta test kutmoqda`}
            {status === "running" && "Tekshirilmoqda…"}
            {status === "timeout" && "Vaqt tugadi"}
            {status === "error" && "Kodda xato"}
            {status === "done" &&
              (passed === TESTS.length ? (
                <span className="text-ok">
                  {`Hammasi o'tdi — ${passed} / ${TESTS.length}`}
                </span>
              ) : (
                <span className="text-fail">
                  {`${passed} / ${TESTS.length} test o'tdi`}
                </span>
              ))}
          </p>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={status === "running"}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {status === "running" ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Play aria-hidden className="size-4" />
          )}
          Ishga tushirish
        </button>
      </div>

      {(status === "error" || status === "timeout") && (
        <p className="border-t border-line bg-raised px-4 py-3 font-mono text-xs leading-relaxed text-fail">
          {status === "timeout"
            ? "Kod 2,5 soniyadan ko'p ishladi. Cheksiz sikl bo'lishi mumkin."
            : message}
        </p>
      )}

      {status === "done" && firstFailure >= 0 && results && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-line bg-raised px-4 py-3 font-mono text-xs">
          <dt className="text-muted">kirish</dt>
          <dd className="text-ink-dim">
            {`nums = ${JSON.stringify(TESTS[firstFailure].nums)}, target = ${TESTS[firstFailure].target}`}
          </dd>
          <dt className="text-muted">kutilgan</dt>
          <dd className="text-ink-dim">
            {JSON.stringify(TESTS[firstFailure].expected)}
          </dd>
          <dt className="text-muted">sizniki</dt>
          <dd className="text-fail">{results[firstFailure].got}</dd>
        </dl>
      )}
    </div>
  );
}
