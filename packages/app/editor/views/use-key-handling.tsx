import { useEditorState } from "./use-editor-state";
import { useEffect } from "react";
import { action } from "mobx";
import { Commands } from "../commands/commands";

export function useKeyHandling() {
  const editorState = useEditorState();
  const commands = Commands.get(editorState);

  useEffect(() => {
    const onKeyDown = action((e: KeyboardEvent) => {
      if (commands.handleKeyDown(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    const onKeyUp = action((e: KeyboardEvent) => {
      commands.handleKeyUp(e);
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [commands]);
}
