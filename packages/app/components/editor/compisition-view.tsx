import { Node } from "@/document/node";
import { useEditorState } from "./use-editor-state";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { nanoid } from "nanoid";

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

  const onPointerDown = (e: React.PointerEvent) => {
    if (editorState.tool === "rectangle") {
      const document = editorState.document;

      const rootNode = document.currentTimelineItem.node;
      document.nodes.add(nanoid(), {
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
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // TODO
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // TODO
  };

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
