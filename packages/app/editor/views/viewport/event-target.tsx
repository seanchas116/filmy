import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { nanoid } from "nanoid";
import { action } from "mobx";
import { Vec2 } from "paintvec";
import { assertNonNull } from "@/utils/assert";

export const EventTarget = observer(() => {
  const editorState = useEditorState();

  const insertionStateRef = useRef<{
    type: "rectangle" | "ellipse" | "text";
    node: Node;
    startX: number;
    startY: number;
  } | null>(null);

  const onPointerDown = action((e: React.PointerEvent) => {
    if (editorState.tool) {
      const document = editorState.document;
      const docPos = new Vec2(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      ).transform(editorState.scroll.viewportToDocument);

      const frame = assertNonNull(document.currentPage.childAt(0));

      const node = document.nodes.add(nanoid(), {
        parent: frame.id,
        order: frame.children.length,
        ...(editorState.tool === "rectangle"
          ? { type: "rectangle" }
          : editorState.tool === "ellipse"
            ? { type: "ellipse" }
            : { type: "text", text: "Text" }),
        x: docPos.x,
        y: docPos.y,
        w: 100,
        h: 100,
        fill: {
          type: "solid",
          hex: "#ff0000",
        },
        stroke: {
          width: 1,
          fill: {
            type: "solid",
            hex: "#000000",
          },
        },
      });

      insertionStateRef.current = {
        type: editorState.tool,
        node,
        startX: docPos.x,
        startY: docPos.y,
      };
    }
  });

  const onPointerMove = action((e: React.PointerEvent) => {
    const docPos = new Vec2(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    ).transform(editorState.scroll.viewportToDocument);

    if (editorState.tool && insertionStateRef.current) {
      const node = insertionStateRef.current.node;
      const state = insertionStateRef.current;

      const x1 = state.startX;
      const y1 = state.startY;
      const x2 = docPos.x;
      const y2 = docPos.y;

      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const w = Math.abs(x2 - x1);
      const h = Math.abs(y2 - y1);

      if (node.data.type === "rectangle" || node.data.type === "ellipse") {
        node.data = { ...node.data, x, y, w, h };
      }
    }
  });

  const onPointerUp = action(() => {
    editorState.tool = undefined;
    insertionStateRef.current = null;
  });

  return editorState.tool ? (
    <div
      className="absolute inset-0"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  ) : null;
});
