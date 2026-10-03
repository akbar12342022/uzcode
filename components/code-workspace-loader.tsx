"use client";

import dynamic from "next/dynamic";
import { EditorPlaceholder } from "@/components/editor-placeholder";

// The workspace restores the saved language and code from localStorage, which
// only exists in the browser, so it is never rendered on the server.
export const CodeWorkspaceLoader = dynamic(
  () => import("@/components/code-workspace").then((mod) => mod.CodeWorkspace),
  { ssr: false, loading: () => <EditorPlaceholder /> },
);
