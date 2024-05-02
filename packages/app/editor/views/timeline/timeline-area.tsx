import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { TimelineItem } from "@/document/timeline-item";
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
      {state.rowsToShow.flatMap((row, timelineIndex) => {
        return row.previews.map((preview) => (
          <TimelineAreaItem
            key={preview.item.id}
            rowHeight={state.rowHeight}
            scale={state.scale}
            item={preview.item}
            start={preview.start}
            duration={preview.duration}
            timelineIndex={timelineIndex}
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
  item: TimelineItem;
  timelineIndex: number;
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
    timelineIndex,
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
          top: timelineIndex * rowHeight,
          height: rowHeight,
          left: start * scale,
          width: duration * scale,
        }}
      />
    );
  }
);
