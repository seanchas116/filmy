import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { TrackItem } from "@/document/track-item";
import { useEffect, useState } from "react";
import { TimelineAreaState } from "./timeline-area-state";
import {
  VideoThumbnailRenderer,
  VideoThumbnailFrame,
} from "@/utils/video-thumbnail";
import { getOrCreate } from "@/utils/get-or-create";
import { CompositionRenderer } from "../viewport/composition-renderer";
import { Sequence } from "@/document/sequence";

export const TimelineArea: React.FC<{
  className?: string;
}> = observer(({ className }) => {
  const editorState = useEditorState();

  const [state] = useState(() => new TimelineAreaState(editorState));

  return (
    <div
      className={twMerge("relative", className)}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {state.rowsToShow.flatMap((row, trackIndex) => {
        return row.previews.map((preview) => (
          <TimelineAreaItem
            key={preview.item.id}
            rowHeight={state.rowHeight}
            scale={state.scale}
            item={preview.item}
            start={preview.start}
            duration={preview.duration}
            trackIndex={trackIndex}
            onMoveStart={() => {}}
            onMove={(totalDeltaX, totalDeltaY) => {
              state.move(preview.item.id, totalDeltaX, totalDeltaY);
            }}
            onMoveEnd={() => {
              state.end();
            }}
          />
        ));
      })}
    </div>
  );
});

const TimelineAreaItem: React.FC<{
  rowHeight: number;
  scale: number;
  item: TrackItem;
  trackIndex: number;
  start: number;
  duration: number;
  onMoveStart: () => void;
  onMove: (totalDeltaX: number, totalDeltaY: number) => void;
  onMoveEnd: () => void;
}> = observer(
  ({
    rowHeight,
    scale,
    item,
    trackIndex,
    start,
    duration,
    onMove,
    onMoveEnd,
    onMoveStart,
  }) => {
    const editorState = useEditorState();

    const onMouseDown = action((e: React.MouseEvent) => {
      if (e.button !== 0) {
        return;
      }

      if (!e.shiftKey) {
        editorState.document.selection.clearNodeSelection();
      }
      item.node.select();

      onMoveStart();

      const initX = e.clientX;
      const initY = e.clientY;

      const onMouseMove = action((e: MouseEvent) => {
        const totalDeltaX = e.clientX - initX;
        const totalDeltaY = e.clientY - initY;

        onMove(totalDeltaX, totalDeltaY);
      });

      const onMouseUp = action(() => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        onMoveEnd();
      });

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });

    return (
      <div
        className={twMerge(
          "bg-gray-100 absolute h-full top-0 rounded-lg border-2 border-gray-200 overflow-hidden",
          item === editorState.document.selection.currentScene &&
            "border-blue-300",
          item.selected && "border-blue-500"
        )}
        onMouseDown={onMouseDown}
        style={{
          top: trackIndex * rowHeight,
          height: rowHeight,
          left: start * scale,
          width: duration * scale,
        }}
      >
        <Thumbnail
          item={item}
          widthPerMS={scale}
          width={duration * scale}
          height={rowHeight}
          thumbnailWidth={48}
        />
        {/* drag start */}
        <div
          className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize bg-gray-200/50"
          onMouseDown={(e) => {
            e.stopPropagation();

            const initX = e.clientX;
            const initStart = item.start;
            // const initTrim = item.trim;
            const initDuration = item.duration;

            const onMouseMove = action((e: MouseEvent) => {
              const totalDeltaX = e.clientX - initX;

              const newStart = Math.max(0, initStart + totalDeltaX / scale);
              // const newTrim = Math.max(0, initTrim + totalDeltaX / scale);
              const newDuration = Math.max(
                0,
                initDuration - totalDeltaX / scale
              );

              item.data = {
                ...item.data,
                start: newStart,
                // trim: newTrim,
                duration: newDuration,
              };
            });

            const onMouseUp = action(() => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);

              editorState.document.undoManager.commit();
            });

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
        />

        {/* drag end */}

        <div
          className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize bg-gray-200/50"
          onMouseDown={(e) => {
            e.stopPropagation();

            const initX = e.clientX;
            const initDuration = duration;

            const onMouseMove = action((e: MouseEvent) => {
              const totalDeltaX = e.clientX - initX;

              const newDuration = Math.max(
                0,
                initDuration + totalDeltaX / scale
              );

              item.data = {
                ...item.data,
                duration: newDuration,
              };
            });

            const onMouseUp = action(() => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);

              editorState.document.undoManager.commit();
            });

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
        />
      </div>
    );
  }
);

const videoThumbnails = new Map<string, VideoThumbnailRenderer>();

const thumbnailRenderWidth = 48;
const thumbnailRenderHeight = 36;

class ShapeThumbnailRenderer {
  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = thumbnailRenderWidth;
    canvas.height = thumbnailRenderHeight;
    this.renderer = new CompositionRenderer(canvas);
  }

  render(sequence: Sequence, item: TrackItem) {
    this.renderer.context.resetTransform();
    this.renderer.clear();
    this.renderer.context.scale(
      thumbnailRenderWidth / sequence.width,
      thumbnailRenderHeight / sequence.height
    );
    this.renderer.renderNode(
      item.node,
      item,
      item.start + item.duration / 2,
      false
    );
    return this.renderer.canvas.toDataURL();
  }

  renderer: CompositionRenderer;
}

const shapeThumbnailRenderer = new ShapeThumbnailRenderer();

const VideoThumbnail: React.FC<{
  item: TrackItem;
  widthPerMS: number;
  width: number;
  height: number;
  thumbnailWidth: number;
  className?: string;
}> = observer(
  ({ item, widthPerMS, width, height, thumbnailWidth, className }) => {
    const [thumbnails, setThumbnails] = useState<VideoThumbnailFrame[]>([]);

    const nodeID = item.node.id;
    const nodeData = item.node.data;

    useEffect(() => {
      if (nodeData.type !== "video") {
        return;
      }
      const src = nodeData.src;

      const videoThumbnail = getOrCreate(
        videoThumbnails,
        nodeID,
        () =>
          new VideoThumbnailRenderer(
            src,
            thumbnailRenderWidth,
            thumbnailRenderHeight
          )
      );

      const generateThumbnails = async () => {
        const thumbnails: VideoThumbnailFrame[] = [];

        for (let i = 0; i < width / thumbnailWidth; i++) {
          const time =
            ((i + 0.5) * (thumbnailWidth / widthPerMS) - nodeData.start) / 1000;
          console.log(time);
          thumbnails.push(await videoThumbnail.getAt(time));
        }

        return thumbnails;
      };

      void generateThumbnails().then((thumbnails) => {
        setThumbnails(thumbnails);
      });
    }, [nodeData, thumbnailWidth, width, widthPerMS, nodeID]);

    if (!thumbnails.length) {
      return null;
    }

    return (
      <div className={twMerge("flex pointer-events-none", className)}>
        {thumbnails.map((thumbnail, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            alt=""
            src={thumbnail.dataURL}
            width={thumbnailWidth}
            height={height}
          />
        ))}
      </div>
    );
  }
);

const Thumbnail: React.FC<{
  item: TrackItem;
  widthPerMS: number;
  width: number;
  height: number;
  thumbnailWidth: number;
  className?: string;
}> = observer(
  ({ item, widthPerMS, width, height, thumbnailWidth, className }) => {
    if (item.node.type === "video") {
      return (
        <VideoThumbnail
          item={item}
          widthPerMS={widthPerMS}
          width={width}
          height={height}
          thumbnailWidth={thumbnailWidth}
          className={className}
        />
      );
    }

    // TODO: cache with computed
    const thumbnail = shapeThumbnailRenderer.render(
      item.document.currentSequence,
      item
    );

    return (
      <div
        className={twMerge("flex pointer-events-none", className)}
        style={{
          width,
          height,
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 8px 8px",
        }}
      >
        <div style={{ width, height, background: `url(${thumbnail})` }}></div>
      </div>
    );
  }
);
