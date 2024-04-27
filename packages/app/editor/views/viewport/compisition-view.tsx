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
  const data = node.data;

  const onClick = action(() => {
    editorState.selectedNodeIds.clear();
    editorState.selectedNodeIds.add(node.id);
    console.log("click", node.id);
  });

  switch (data.type) {
    case "rectangle":
      return (
        <rect
          x={data.x}
          y={data.y}
          width={data.w}
          height={data.h}
          fill="red"
          onMouseDown={onClick}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx={data.x + data.w / 2}
          cy={data.y + data.h / 2}
          rx={data.w / 2}
          ry={data.h / 2}
          fill="red"
          onMouseDown={onClick}
        />
      );
    case "text":
      return (
        <text x={data.x} y={data.y} fill="black" onMouseDown={onClick}>
          {data.text}
        </text>
      );
  }
});
