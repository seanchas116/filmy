import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { NodeResizeBox } from "./node-resize-box";
import { action } from "mobx";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const node = editorState.document.currentTimelineItem.node;

  return (
    <svg width={800} height={600} className="bg-white shadow-md">
      <NodeRenderer node={node} />
      <NodeResizeBox />
    </svg>
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
  const editorState = useEditorState();

  const detail = node.data.detail;
  if (!detail) {
    return;
  }

  const onClick = action(() => {
    editorState.selectedNodeIds.clear();
    editorState.selectedNodeIds.add(node.id);
    console.log("click", node.id);
  });

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
            onMouseDown={onClick}
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
            onMouseDown={onClick}
          />
        );
      case "text":
        return (
          <text
            x={detail.shape.x}
            y={detail.shape.y}
            fill="black"
            onMouseDown={onClick}
          >
            {detail.shape.text}
          </text>
        );
    }
  }
});
