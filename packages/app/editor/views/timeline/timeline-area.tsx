import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { TrackItem } from "@/document/track-item";
import { useEffect, useState } from "react";
import { TimelineAreaState } from "./timeline-area-state";
import {
  VideoThumbnail,
  VideoThumbnailFrame,
} from "@/utils/video-thumbnail-generator";
import { getOrCreate } from "@/utils/get-or-create";

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
        editorState.document.selection.clear();
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
        className="bg-gray-100 absolute h-full top-0 rounded-lg border border-gray-200 aria-selected:border-blue-500 overflow-hidden"
        aria-selected={item.selected}
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
          thumbnailWidth={64}
        />
        {/* drag start */}
        <div
          className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize bg-gray-200/50"
          onMouseDown={(e) => {
            e.stopPropagation();

            const initX = e.clientX;
            const initStart = item.start;
            const initTrim = item.trim;
            const initDuration = item.duration;

            const onMouseMove = action((e: MouseEvent) => {
              const totalDeltaX = e.clientX - initX;

              const newStart = Math.max(0, initStart + totalDeltaX / scale);
              const newTrim = Math.max(0, initTrim + totalDeltaX / scale);
              const newDuration = Math.max(
                0,
                initDuration - totalDeltaX / scale
              );

              item.data = {
                ...item.data,
                start: newStart,
                trim: newTrim,
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

const videoThumbnails = new Map<string, VideoThumbnail>();

export const Thumbnail: React.FC<{
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
    const trim = item.trim;

    useEffect(() => {
      if (nodeData.type !== "video") {
        return;
      }
      const src = nodeData.src;

      const videoThumbnail = getOrCreate(
        videoThumbnails,
        nodeID,
        () => new VideoThumbnail(src, 64, 48)
      );

      const generateThumbnails = async () => {
        const thumbnails: VideoThumbnailFrame[] = [];

        for (let i = 0; i < width / thumbnailWidth; i++) {
          const time =
            ((i + 0.5) * (thumbnailWidth / widthPerMS) + trim) / 1000;
          thumbnails.push(await videoThumbnail.getAt(time));
        }

        return thumbnails;
      };

      void generateThumbnails().then((thumbnails) => {
        setThumbnails(thumbnails);
      });
    }, [nodeData, trim, thumbnailWidth, width, widthPerMS, nodeID]);

    if (!thumbnails.length) {
      return null;
    }

    // place images in array

    return (
      <div
        className={twMerge("flex pointer-events-none", className)}
        style={{ width, height }}
      >
        {thumbnails.map((thumbnail, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={thumbnail.dataURL}
            alt=""
            style={{
              width: thumbnailWidth,
              height: height,
            }}
          />
        ))}
      </div>
    );
  }
);
