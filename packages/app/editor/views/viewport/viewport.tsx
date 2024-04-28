import { CompositionView } from "./compisition-view";
import { useEditorState } from "../use-editor-state";
import { EventTarget } from "./event-target";
import { useRef } from "react";
import { useObserveDOMClientRect } from "./use-observe-dom-client-rect";
import { HUD } from "./hud";

export function Viewport() {
  const editorState = useEditorState();

  const ref = useRef<HTMLDivElement>(null);

  useObserveDOMClientRect(ref);

  return (
    <div className="bg-gray-100 relative overflow-hidden" ref={ref}>
      <div
        className="absolute"
        style={{
          transform: editorState.scroll.documentToViewport.toCSSMatrixString(),
        }}
      >
        <CompositionView />
      </div>
      <EventTarget />
      <HUD />
    </div>
  );
}
