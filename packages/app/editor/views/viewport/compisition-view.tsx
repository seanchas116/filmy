import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";

export const CompositionView: React.FC = observer(() => {
  const editorState = useEditorState();
  const nodes = editorState.document.currentSequence.timelines
    .toReversed()
    .flatMap((timeline) => timeline.itemsAt(editorState.currentTime))
    .map((item) => item.node);

  const width = 640;
  const height = 480;

  return (
    <div
      className="relative"
      style={{
        width,
        height,
      }}
    >
      {nodes.map((child) =>
        child.data.type === "video" ? (
          <VideoRenderer key={child.id} node={child} />
        ) : (
          <svg
            key={child.id}
            width={width}
            height={height}
            className="absolute left-0 top-0"
          >
            <NodeRenderer key={child.id} node={child} />
          </svg>
        )
      )}
    </div>
  );
});

const VideoRenderer: React.FC<{
  node: Node;
}> = observer(({ node }) => {
  const editorState = useEditorState();

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const interval = setInterval(() => {
      const targetTime = editorState.currentTime / 1000;
      const diff = Math.abs(video.currentTime - targetTime);
      if (diff < 1 / 60) {
        return;
      }
      video.currentTime = targetTime;
    }, 10);
    return () => {
      clearInterval(interval);
    };
  }, [editorState]);

  if (node.data.type !== "video") {
    return;
  }

  return (
    <video
      data-node-id={node.id}
      src={node.data.src}
      width={node.data.w}
      height={node.data.h}
      className="absolute"
      style={{
        left: node.data.x,
        top: node.data.y,
      }}
      playsInline
      autoPlay
      ref={videoRef}
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
