import { createContext, useContext } from "react";
import { EditorState } from "@/editor/state/editor-state";

const EditorStateContext = createContext<EditorState | undefined>(undefined);

export const EditorStateProvider = EditorStateContext.Provider;

export function useEditorState() {
  const editorState = useContext(EditorStateContext);
  if (!editorState) {
    throw new Error(
      "useEditorState must be used within an EditorStateProvider"
    );
  }
  return editorState;
}
