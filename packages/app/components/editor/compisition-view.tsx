import { Node } from "@/document/node";
import { useEditorState } from "./use-editor-state";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { nanoid } from "nanoid";
import { action } from "mobx";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const node = editorState.document.currentTimelineItem.node;

  return (
    <div className="relative">
      <svg width={800} height={600} className="bg-white shadow-md">
        <NodeRenderer node={node} />
      </svg>
      <EventTarget />
    </div>
  );
});

const EventTarget = observer(() => {
  const editorState = useEditorState();

  const insertionStateRef = useRef<{
    type: "rectangle" | "ellipse" | "text";
    node: Node;
    startX: number;
    startY: number;
  } | null>(null);

  const onPointerDown = action((e: React.PointerEvent) => {
    if (editorState.tool === "rectangle") {
      const document = editorState.document;

      const rootNode = document.currentTimelineItem.node;
      const node = document.nodes.add(nanoid(), {
        parent: rootNode.id,
        order: rootNode.children.length,
        detail: {
          type: "shape",
          shape: {
            type: "rectangle",
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
            w: 100,
            h: 100,
          },
          fill: {
            type: "solid",
            color: { r: 255, g: 0, b: 0, a: 1 },
          },
          stroke: {
            width: 1,
            fill: {
              type: "solid",
              color: { r: 0, g: 0, b: 0, a: 1 },
            },
          },
        },
      });

      insertionStateRef.current = {
        type: "rectangle",
        node,
        startX: e.nativeEvent.offsetX,
        startY: e.nativeEvent.offsetY,
      };
    }
  });

  const onPointerMove = action((e: React.PointerEvent) => {
    if (editorState.tool === "rectangle" && insertionStateRef.current) {
      const state = insertionStateRef.current;
      const detail = state.node.data.detail;
      if (detail && detail.shape.type === "rectangle") {
        const x1 = state.startX;
        const y1 = state.startY;
        const x2 = e.nativeEvent.offsetX;
        const y2 = e.nativeEvent.offsetY;

        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);

        state.node.detail = {
          ...detail,
          shape: {
            ...detail.shape,
            x,
            y,
            w,
            h,
          },
        };
      }
    }
  });

  const onPointerUp = action((e: React.PointerEvent) => {
    editorState.tool = undefined;
    insertionStateRef.current = null;
  });

  return (
    <div
      className="absolute inset-0"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
});

const NodeRenderer: React.FC<{
  node: Node;
}> = observer(({ node }) => {
  return (
    <>
      <ShapeRenderer node={node} />
      {node.children.map((child) => (
        <NodeRenderer key={child.id} node={child} />
      ))}
    </>
  );
});

const ShapeRenderer: React.FC<{
  node: Node;
}> = observer(({ node }) => {
  const detail = node.data.detail;
  if (!detail) {
    return;
  }

  if (detail.shape) {
    switch (detail.shape.type) {
      case "rectangle":
        return (
          <rect
            x={detail.shape.x}
            y={detail.shape.y}
            width={detail.shape.w}
            height={detail.shape.h}
            fill="red"
          />
        );
      case "ellipse":
        return (
          <ellipse
            cx={detail.shape.x}
            cy={detail.shape.y}
            rx={detail.shape.w}
            ry={detail.shape.h}
            fill="red"
          />
        );
      case "text":
        return (
          <text x={detail.shape.x} y={detail.shape.y} fill="black">
            {detail.shape.text}
          </text>
        );
    }
  }
});
