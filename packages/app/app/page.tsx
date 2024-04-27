"use client";

import { Editor } from "@/editor/views/editor";
import { EditorState } from "@/editor/state/editor-state";
import { EditorStateProvider } from "@/editor/views/use-editor-state";
import { useState } from "react";

export default function Home() {
  const [editorState] = useState(() => new EditorState());

  return (
    <EditorStateProvider value={editorState}>
      <Editor />
    </EditorStateProvider>
  );
}
