import { Node } from "@/document/node";
import { useEditorState } from "./use-editor-state";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { nanoid } from "nanoid";
import { action } from "mobx";
import { ShapeData } from "@/document/schema";

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
    if (editorState.tool) {
      const document = editorState.document;

      const rootNode = document.currentTimelineItem.node;

      const shape: ShapeData =
        editorState.tool === "rectangle"
          ? {
              type: "rectangle",
              x: e.nativeEvent.offsetX,
              y: e.nativeEvent.offsetY,
              w: 100,
              h: 100,
            }
          : editorState.tool === "ellipse"
          ? {
              type: "ellipse",
              x: e.nativeEvent.offsetX,
              y: e.nativeEvent.offsetY,
              w: 50,
              h: 50,
            }
          : {
              type: "text",
              x: e.nativeEvent.offsetX,
              y: e.nativeEvent.offsetY,
              text: "Text",
            };

      const node = document.nodes.add(nanoid(), {
        parent: rootNode.id,
        order: rootNode.children.length,
        detail: {
          type: "shape",
          shape,
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
        type: editorState.tool,
        node,
        startX: e.nativeEvent.offsetX,
        startY: e.nativeEvent.offsetY,
      };
    }
  });

  const onPointerMove = action((e: React.PointerEvent) => {
    if (editorState.tool && insertionStateRef.current) {
      const state = insertionStateRef.current;
      const detail = state.node.data.detail;
      if (detail?.shape) {
        const x1 = state.startX;
        const y1 = state.startY;
        const x2 = e.nativeEvent.offsetX;
        const y2 = e.nativeEvent.offsetY;

        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);

        if (
          detail.shape.type === "rectangle" ||
          detail.shape.type === "ellipse"
        ) {
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
            cx={detail.shape.x + detail.shape.w / 2}
            cy={detail.shape.y + detail.shape.h / 2}
            rx={detail.shape.w / 2}
            ry={detail.shape.h / 2}
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
