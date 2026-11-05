"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type {
  JudgeMode,
  JudgeReport,
  JudgeResponse,
  Verdict,
} from "@/lib/judge-types";
import { cn } from "@/lib/utils";

export type JudgeState =
  | { status: "pending"; mode: JudgeMode }
  | { status: "done"; mode: JudgeMode; response: JudgeResponse };

const VERDICTS: Record<Verdict, { label: string; tone: string }> = {
  ACCEPTED: { label: "Qabul qilindi", tone: "text-ok" },
  WRONG_ANSWER: { label: "Noto'g'ri javob", tone: "text-fail" },
  TIME_LIMIT_EXCEEDED: { label: "Vaqt chegarasidan oshdi", tone: "text-warn" },
  RUNTIME_ERROR: { label: "Bajarilish xatosi", tone: "text-fail" },
  COMPILE_ERROR: { label: "Kompilyatsiya xatosi", tone: "text-fail" },
  INTERNAL_ERROR: { label: "Tizim xatosi", tone: "text-fail" },
};

function peak(values: (number | null)[]) {
  const known = values.filter((value) => value !== null);
  return known.length > 0 ? Math.max(...known) : null;
}

function Output({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <pre className="scroll-pane mt-1.5 max-h-40 overflow-auto rounded-md border border-line bg-surface px-3 py-2 font-mono text-sm leading-relaxed">
        {value === "" ? <span className="text-muted">{"(bo'sh)"}</span> : value}
      </pre>
    </div>
  );
}

function Report({ report }: { report: JudgeReport }) {
  // Open on the first failing test: that is the one worth reading.
  const firstFailure = report.tests.findIndex(
    ({ verdict }) => verdict !== "ACCEPTED",
  );
  const [selected, setSelected] = useState(Math.max(firstFailure, 0));
  const test = report.tests[selected];

  const passedEverything = report.verdict === "ACCEPTED";
  const headline =
    passedEverything && report.mode === "run"
      ? "Namuna testlardan o'tdi"
      : VERDICTS[report.verdict].label;

  const timeMs = peak(report.tests.map(({ timeMs }) => timeMs));
  const memoryKb = peak(report.tests.map(({ memoryKb }) => memoryKb));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className={cn("text-lg font-semibold", VERDICTS[report.verdict].tone)}>
          {headline}
        </p>
        <p className="font-mono text-sm text-muted">
          {report.passed}/{report.total} test
          {passedEverything && timeMs !== null && ` · ${timeMs} ms`}
          {passedEverything &&
            memoryKb !== null &&
            ` · ${(memoryKb / 1024).toFixed(1)} MB`}
        </p>
      </div>

      {report.verdict === "COMPILE_ERROR" ? (
        <Output label="Kompilyator xabari" value={report.compileOutput} />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {report.tests.map(({ verdict }, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={index === selected}
                aria-label={`${index + 1}-test: ${VERDICTS[verdict].label}`}
                onClick={() => setSelected(index)}
                className={cn(
                  "size-7 rounded-[3px] border font-mono text-xs transition-colors",
                  verdict === "ACCEPTED"
                    ? "border-ok text-ok"
                    : "border-fail text-fail",
                  index === selected
                    ? verdict === "ACCEPTED"
                      ? "bg-ok/20"
                      : "bg-fail/20"
                    : "hover:bg-raised",
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">{selected + 1}-test:</span>{" "}
              <span className={VERDICTS[test.verdict].tone}>
                {VERDICTS[test.verdict].label}
              </span>
            </p>
            {test.details ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Output label="Kirish" value={test.details.input} />
                  <Output
                    label="Kutilgan chiqish"
                    value={test.details.expectedOutput}
                  />
                </div>
                <Output label="Sizning chiqishingiz" value={test.details.stdout} />
                {test.details.stderr !== "" && (
                  <Output label="Xato xabari" value={test.details.stderr} />
                )}
              </>
            ) : (
              <p className="text-sm text-muted">
                {"Bu yashirin test: uning kirish va chiqish ma'lumotlari ko'rsatilmaydi."}
              </p>
            )}
          </div>
        </>
      )}

      {report.mode === "submit" && (
        <p className="text-xs text-muted">
          Natija hozircha saqlanmaydi.
        </p>
      )}
    </div>
  );
}

/** Result of the last run or submit, shown under the editor. */
export function JudgePanel({
  state,
  onClose,
}: {
  state: JudgeState;
  onClose: () => void;
}) {
  return (
    <section
      aria-label="Tekshiruv natijasi"
      className="scroll-pane max-h-[50%] shrink-0 overflow-y-auto border-t border-line bg-bg"
    >
      <div className="flex items-center justify-between gap-3 px-3 pt-2.5">
        <h2 className="font-mono text-xs font-medium text-muted">
          {state.mode === "run"
            ? "Ishga tushirish natijasi"
            : "Yuborish natijasi"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Natijani yopish"
          className="rounded-md p-1 text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <div aria-live="polite" className="px-3 pt-1.5 pb-3">
        {state.status === "pending" ? (
          <p className="text-sm text-muted">
            {state.mode === "run"
              ? "Namuna testlarda ishga tushirilmoqda…"
              : "Barcha testlarda tekshirilmoqda…"}
          </p>
        ) : state.response.ok ? (
          <Report report={state.response.report} />
        ) : (
          <p className="text-sm text-fail">{state.response.message}</p>
        )}
      </div>
    </section>
  );
}
