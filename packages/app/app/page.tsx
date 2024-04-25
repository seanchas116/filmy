"use client";

import { useState } from "react";
import { EditorState } from "./editor-state";
import { Node } from "@/document/node";

export default function Home() {
  const [editorState] = useState(() => new EditorState());

  const node = editorState.document.currentTimelineItem.node;

  return (
    <svg width={1600} height={1200}>
      <NodeRenderer node={node} />
    </svg>
  );
}

function NodeRenderer({ node }: { node: Node }) {
  const detail = node.data.detail;

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
}
