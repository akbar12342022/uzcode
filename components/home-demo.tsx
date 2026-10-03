"use client";

import { Check, LoaderCircle, Play, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
    var startedAt = Date.now();
    try {
      var got = solve(test.nums.slice(), test.target);
      results.push({ ok: matches(got, test.expected), got: show(got), ms: Date.now() - startedAt });
    } catch (error) {
      results.push({ ok: false, got: "xato: " + readMessage(error), ms: Date.now() - startedAt });
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

type TestResult = { ok: boolean; got: string; ms: number };
type Status = "idle" | "running" | "done" | "error" | "timeout";

function describe(test: (typeof TESTS)[number]) {
  return `nums = ${JSON.stringify(test.nums)}, target = ${test.target}`;
}

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

  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-3 border-b border-line bg-raised/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        <p className="font-mono text-sm text-ink">twoSum.js</p>
        <p className="ml-auto font-mono text-xs text-muted">
          JavaScript · 2 s
        </p>
      </div>

      <div className="border-b border-line px-4 py-3.5">
        <p className="text-sm leading-relaxed text-ink-dim">
          {
            "Butun sonlar ro'yxati va nishon son berilgan. Yig'indisi nishonga teng bo'lgan ikki sonning indekslarini qaytaring."
          }
        </p>
      </div>

      <div className="h-[208px] border-b border-line sm:h-[252px]">
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

      <ol className="divide-y divide-line/70 border-b border-line bg-bg/40 font-mono text-xs">
        {TESTS.map((test, index) => {
          const result = results?.[index];
          return (
            <li
              key={index}
              className="flex items-center gap-3 px-4 py-2 whitespace-nowrap"
            >
              <span className="w-12 shrink-0 text-muted">
                test {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-dim">
                {describe(test)}
              </span>
              {result ? (
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1.5",
                    result.ok ? "text-ok" : "text-fail",
                  )}
                >
                  {result.ok ? (
                    <Check aria-hidden className="size-3.5" />
                  ) : (
                    <X aria-hidden className="size-3.5" />
                  )}
                  {result.ok ? "o'tdi" : result.got}
                </span>
              ) : (
                <span className="shrink-0 text-muted">—</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <TestCells total={TESTS.length} results={cells} />
          <p aria-live="polite" className="text-sm text-muted">
            {status === "idle" && `${TESTS.length} ta test tayyor`}
            {status === "running" && "Tekshirilmoqda…"}
            {status === "timeout" && "Vaqt tugadi"}
            {status === "error" && (message ?? "Kodda xato")}
            {status === "done" && (
              <span className={passed === TESTS.length ? "text-ok" : "text-fail"}>
                {`${passed} / ${TESTS.length} test o'tdi`}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={status === "running"}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {status === "running" ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Play aria-hidden className="size-4" />
          )}
          Ishga tushirish
        </button>
      </div>
    </div>
  );
}
