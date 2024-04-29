import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const nodes = editorState.document.currentSequence.timelines
    .flatMap((timeline) => timeline.itemsAt(editorState.currentTime))
    .map((item) => item.node);

  return (
    <svg width={640} height={480} className="absolute left-0 top-0 bg-white">
      {nodes.map((child) => (
        <NodeRenderer key={child.id} node={child} />
      ))}
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
  const data = node.data;

  switch (data.type) {
    case "rectangle":
      return (
        <rect
          data-node-id={node.id}
          x={data.x}
          y={data.y}
          width={data.w}
          height={data.h}
          fill={data.fill?.hex}
          strokeWidth={data.stroke?.width}
          stroke={data.stroke?.fill.hex}
        />
      );
    case "ellipse":
      return (
        <ellipse
          data-node-id={node.id}
          cx={data.x + data.w / 2}
          cy={data.y + data.h / 2}
          rx={data.w / 2}
          ry={data.h / 2}
          fill={data.fill?.hex}
          strokeWidth={data.stroke?.width}
          stroke={data.stroke?.fill.hex}
        />
      );
    case "text":
      return (
        <text
          data-node-id={node.id}
          x={data.x}
          y={data.y + 16}
          fontSize={16}
          fill={data.fill?.hex}
          strokeWidth={data.stroke?.width}
          stroke={data.stroke?.fill.hex}
        >
          {data.text}
        </text>
      );
  }
});
