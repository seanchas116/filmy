import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { TrackItem } from "@/document/track-item";
import { useState } from "react";
import { TimelineAreaState } from "./timeline-area-state";

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
        className="bg-gray-100 absolute h-full top-0 rounded-lg border border-gray-200 aria-selected:border-blue-500"
        aria-selected={item.selected}
        onMouseDown={onMouseDown}
        style={{
          top: trackIndex * rowHeight,
          height: rowHeight,
          left: start * scale,
          width: duration * scale,
        }}
      >
        {/* drag start */}
        <div
          className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize"
          onMouseDown={(e) => {
            e.stopPropagation();

            const initX = e.clientX;
            const initStart = start;
            const initDuration = duration;

            const onMouseMove = action((e: MouseEvent) => {
              const totalDeltaX = e.clientX - initX;

              const newStart = Math.max(0, initStart + totalDeltaX / scale);
              const newDuration = Math.max(
                0,
                initDuration - totalDeltaX / scale
              );

              item.data = {
                ...item.data,
                start: newStart,
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
          className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize"
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
