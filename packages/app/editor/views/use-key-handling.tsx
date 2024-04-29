import { useEditorState } from "./use-editor-state";
import { useEffect } from "react";
import { action } from "mobx";

export function useKeyHandling() {
  const editorState = useEditorState();

  useEffect(() => {
    const onKeyDown = action((e: KeyboardEvent) => {
      if (editorState.handleKeyDown(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    const onKeyUp = action((e: KeyboardEvent) => {
      editorState.handleKeyUp(e);
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [editorState]);
}
