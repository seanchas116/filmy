import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { Vec2 } from "paintvec";
import { usePointerStroke } from "@/editor/components/use-pointer-stroke";
import { DragHandler } from "./drag-handlers/drag-handler";
import { InsertDragHandler } from "./drag-handlers/insert-drag-handler";
import { ViewportEvent } from "./drag-handlers/viewport-event";
import { EditorState } from "@/editor/state/editor-state";
import { compact } from "lodash-es";
import { Node } from "@/document/node";
import { useMemo } from "react";
import { ClickMoveDragHandler } from "./drag-handlers/click-move-drag-handler";
import { action } from "mobx";
import { showContextMenu } from "@/editor/components/context-menu-state";
import { showNodeContextMenu } from "../show-context-menu";
import { twMerge } from "tailwind-merge";

class ViewportNodePicker {
  constructor(editorState: EditorState) {
    this.editorState = editorState;
  }

  nodesFromPoint(clientX: number, clientY: number): Node[] {
    const elements = document.elementsFromPoint(clientX, clientY);

    return compact(
      [...elements].map((elem) => {
        const id = elem.getAttribute("data-node-id");
        if (!id) {
          return null;
        }
        return this.editorState.document.nodes.safeGet(id);
      })
    );
  }

  editorState: EditorState;
}

export const EventTarget = observer(() => {
  const editorState = useEditorState();

  const nodePicker = useMemo(
    () => new ViewportNodePicker(editorState),
    [editorState]
  );

  const createViewportEvent = useMemo(
    () =>
      (event: React.PointerEvent | React.MouseEvent): ViewportEvent => {
        return new ViewportEvent(
          editorState,
          event.nativeEvent,
          editorState.scroll.documentPosForClientPos(
            new Vec2(event.clientX, event.clientY)
          ),
          nodePicker.nodesFromPoint(event.clientX, event.clientY)
        );
      },
    [editorState, nodePicker]
  );

  const pointerProps = usePointerStroke<
    HTMLDivElement,
    DragHandler | undefined
  >({
    onBegin: action((event) => {
      const viewportEvent = createViewportEvent(event);

      if (editorState.tool) {
        return new InsertDragHandler(viewportEvent, editorState.tool);
      }
      return ClickMoveDragHandler.create(viewportEvent);
    }),
    onMove: action((e, { initData }) => {
      initData?.move(createViewportEvent(e));
    }),
    onEnd: action((e, { initData }) => {
      initData?.end(createViewportEvent(e));
    }),
  });

  const onContextMenu = action((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const node = createViewportEvent(e).node;
    if (node) {
      showNodeContextMenu(editorState, node, e);
    }
  });

  return (
    <div
      className="absolute inset-0"
      {...pointerProps}
      onContextMenu={onContextMenu}
      style={{
        cursor: editorState.tool ? "crosshair" : "default",
      }}
    />
  );
});
