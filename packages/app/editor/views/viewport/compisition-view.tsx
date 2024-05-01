import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { reaction } from "mobx";

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
      className="relative bg-white"
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
    return reaction(
      () => editorState.currentTime,
      (currentTime) => {
        const video = videoRef.current;
        if (!video) {
          return;
        }
        const data = node.data;
        if (data.type !== "video") {
          return;
        }

        const targetTime = (currentTime + data.offset) / 1000;
        const diff = Math.abs(video.currentTime - targetTime);
        // TODO: better seek precision (using requestVideoFrameCallback)
        if (diff < 1) {
          return;
        }
        video.currentTime = targetTime;
      }
    );
  });

  useEffect(() => {
    return reaction(
      () => editorState.isPlaying,
      (isPlaying) => {
        const video = videoRef.current;
        if (!video) {
          return;
        }
        if (isPlaying) {
          void video.play();
        } else {
          video.pause();
        }
      }
    );
  });

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
          y={data.y + data.font.size}
          fontSize={data.font.size}
          fontFamily={data.font.family}
          fontWeight={data.font.weight}
          fill={data.fill?.hex}
          strokeWidth={data.stroke?.width}
          stroke={data.stroke?.fill.hex}
        >
          {data.text}
        </text>
      );
  }
});
