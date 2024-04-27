import { CompositionView } from "./compisition-view";
import { useEditorState } from "../use-editor-state";
import { EventTarget } from "./event-target";

export function Viewport() {
  const editorState = useEditorState();
  return (
    <div className="bg-gray-100 relative">
      <div
        className="absolute"
        style={{
          transform: editorState.scroll.documentToViewport.toCSSMatrixString(),
        }}
      >
        <CompositionView />
      </div>
      <EventTarget />
    </div>
  );
}
