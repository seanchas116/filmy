import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const roots = editorState.document.currentPage.children;

  return roots.map((node) => {
    if (node.data.type !== "frame") {
      return;
    }

    return (
      <svg
        key={node.id}
        data-node-id={node.id}
        width={node.data.w}
        height={node.data.h}
        className="absolute"
        style={{
          left: node.data.x,
          top: node.data.y,
          background: node.data.fill?.hex,
        }}
      >
        {node.children.map((child) => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </svg>
    );
  });
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
