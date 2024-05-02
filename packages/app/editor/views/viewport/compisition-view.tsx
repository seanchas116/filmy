import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { CurrentFrameRenderer } from "./composition-renderer";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const sequence = editorState.document.currentSequence;
  const nodes = sequence.tracks
    .toReversed()
    .flatMap((track) => track.itemsAt(editorState.currentTime))
    .map((item) => item.node);
  const { width, height } = sequence;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.width = width;
    canvas.height = height;

    const renderer = new CurrentFrameRenderer(editorState, canvas);
    return () => {
      renderer.dispose();
    };
  }, [editorState, width, height]);

  return (
    <div
      className="relative bg-white"
      style={{
        width,
        height,
      }}
    >
      <svg width={width} height={height} className="absolute left-0 top-0">
        {nodes.map((node) => (
          <RecursiveHitTest key={node.id} node={node} />
        ))}
      </svg>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute left-0 top-0 pointer-events-none"
      />
    </div>
  );
});

const RecursiveHitTest: React.FC<{
  node: Node;
}> = observer(({ node }) => {
  return (
    <>
      <HitTest node={node} />
      {node.children.map((child) => (
        <RecursiveHitTest key={child.id} node={child} />
      ))}
    </>
  );
});

const HitTest: React.FC<{
  node: Node;
}> = observer(({ node }) => {
  const data = node.data;

  switch (data.type) {
    case "video":
    case "rectangle":
    case "text":
      return (
        <rect
          data-node-id={node.id}
          x={data.x}
          y={data.y}
          width={data.w}
          height={data.h}
          fill="transparent"
          stroke="transparent"
          strokeWidth={data.stroke?.width}
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
          fill="transparent"
          stroke="transparent"
          strokeWidth={data.stroke?.width}
        />
      );
  }
});
