// Languages a solution can be written in. `id` is the key used in
// Problem.starterCode and Submission.language; `monaco` is the editor's
// language id; `file` names the editor model so each language keeps its own
// content and undo history; `judge0Id` is the Judge0 CE language id the code
// is executed with (see GET /languages on the Judge0 instance).
export const LANGUAGES = [
  {
    id: "python",
    label: "Python",
    monaco: "python",
    file: "main.py",
    judge0Id: 71, // Python 3.8.1
  },
  {
    id: "javascript",
    label: "JavaScript",
    monaco: "javascript",
    file: "main.js",
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
  },
  {
    id: "cpp",
    label: "C++",
    monaco: "cpp",
    file: "main.cpp",
    judge0Id: 54, // C++ (GCC 9.2.0)
  },
] as const;

export type Language = (typeof LANGUAGES)[number];
export type LanguageId = Language["id"];

export type StarterCode = Partial<Record<LanguageId, string>>;

export function isLanguageId(value: unknown): value is LanguageId {
  return LANGUAGES.some((language) => language.id === value);
}
