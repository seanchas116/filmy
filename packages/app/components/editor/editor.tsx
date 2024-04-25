"use client";

import { useState } from "react";
import { Node } from "@/document/node";
import { EditorState } from "./editor-state";
import { LeftSideBar } from "./left-sidebar";
import { RightSideBar } from "./right-sidebar";

export function Editor() {
  const [editorState] = useState(() => new EditorState());

  const node = editorState.document.currentTimelineItem.node;

  return (
    <div className="grid grid-cols-[auto,1fr,auto] w-screen h-screen">
      <LeftSideBar />
      <div className="bg-gray-100 flex items-center justify-center">
        <svg width={800} height={600} className="bg-white shadow-md">
          <NodeRenderer node={node} />
        </svg>
      </div>
      <RightSideBar />
    </div>
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
