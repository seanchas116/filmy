import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { TimelineItem } from "@/document/timeline-item";
import { usePointerStroke } from "@/editor/components/use-pointer-stroke";
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
        return row.map((preview) => (
          <TimelineAreaItem
            key={preview.item.id}
            rowHeight={state.rowHeight}
            scale={state.scale}
            item={preview.item}
            start={preview.start}
            duration={preview.duration}
            timelineIndex={timelineIndex}
            onMoveStart={() => {
              // TODO
            }}
            onMove={(totalDeltaX, totalDeltaY) => {
              state.move(preview.item.id, totalDeltaX, totalDeltaY);
            }}
            onMoveEnd={action(() => {
              state.end();
            })}
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
    const pointerProps = usePointerStroke<HTMLDivElement, void>({
      onBegin: action((e) => {
        if (!e.shiftKey) {
          editorState.document.selection.clear();
        }
        item.node.select();

        onMoveStart();
      }),
      onMove: action((e, { totalDeltaX, totalDeltaY }) => {
        onMove(totalDeltaX, totalDeltaY);
      }),
      onEnd: action(() => {
        onMoveEnd();
      }),
    });

    return (
      <div
        className="bg-gray-100 absolute h-full top-0 rounded-lg border border-gray-200 aria-selected:border-blue-500"
        aria-selected={item.selected}
        style={{
          top: timelineIndex * rowHeight,
          height: rowHeight,
          left: start * scale,
          width: duration * scale,
        }}
        {...pointerProps}
      />
    );
  }
);
