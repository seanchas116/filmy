import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { Vec2 } from "paintvec";
import { usePointerStroke } from "@/editor/components/use-pointer-stroke";
import { DragHandler } from "./drag-handlers/drag-handler";
import { InsertDragHandler } from "./drag-handlers/insert-drag-handler";
import { ViewportEvent } from "./drag-handlers/viewport-event";

export const EventTarget = observer(() => {
  const editorState = useEditorState();

  const createViewportEvent = (event: React.PointerEvent): ViewportEvent => {
    return new ViewportEvent(
      editorState,
      event.nativeEvent,
      editorState.scroll.documentPosForClientPos(
        new Vec2(event.clientX, event.clientY)
      ),
      [] // TODO
    );
  };

  const pointerProps = usePointerStroke<
    HTMLDivElement,
    DragHandler | undefined
  >({
    onBegin: (event) => {
      if (editorState.tool) {
        return new InsertDragHandler(
          createViewportEvent(event),
          editorState.tool
        );
      }
    },
    onMove: (e, { initData }) => {
      initData?.move(createViewportEvent(e));
    },
    onEnd: (e, { initData }) => {
      initData?.end(createViewportEvent(e));
    },
  });

  return editorState.tool ? (
    <div className="absolute inset-0" {...pointerProps} />
  ) : null;
});
