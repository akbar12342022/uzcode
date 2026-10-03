// Monaco ships as static files. The app serves them from its own origin
// instead of a public CDN, so the editor opens where that CDN is blocked and
// the page makes no third-party request on load. The copy is generated rather
// than committed: `predev` and `prebuild` run this script.
import { access, cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const source = join(process.cwd(), "node_modules/monaco-editor/min/vs");
const target = join(process.cwd(), "public/monaco/vs");

try {
  await access(source);
} catch {
  console.error(
    "monaco-editor topilmadi. Avval `npm install` ni ishga tushiring.",
  );
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log("monaco -> public/monaco/vs");
