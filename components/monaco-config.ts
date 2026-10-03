"use client";

import { loader } from "@monaco-editor/react";

// Imported for its side effect by every file that mounts an editor. Without
// it, @monaco-editor/react fetches Monaco from a public CDN.
loader.config({ paths: { vs: "/monaco/vs" } });
