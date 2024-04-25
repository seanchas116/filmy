"use client";

import { Editor } from "@/components/editor/editor";
import { EditorState } from "@/components/editor/editor-state";
import { EditorStateProvider } from "@/components/editor/use-editor-state";
import { useState } from "react";

export default function Home() {
  const [editorState] = useState(() => new EditorState());

  return (
    <EditorStateProvider value={editorState}>
      <Editor />
    </EditorStateProvider>
  );
}
