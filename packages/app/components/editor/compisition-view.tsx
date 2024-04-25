import { Node } from "@/document/node";
import { useEditorState } from "./use-editor-state";
import { observer } from "mobx-react-lite";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const node = editorState.document.currentTimelineItem.node;

  return (
    <svg width={800} height={600} className="bg-white shadow-md">
      <NodeRenderer node={node} />
    </svg>
  );
});

const NodeRenderer: React.FC<{
  node: Node;
}> = observer(({ node }) => {
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
});
