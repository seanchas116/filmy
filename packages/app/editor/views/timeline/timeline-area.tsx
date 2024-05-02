import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action, reaction } from "mobx";
import { twMerge } from "tailwind-merge";
import { TimelineItem } from "@/document/timeline-item";
import { Timeline } from "@/document/timeline";
import { usePointerStroke } from "@/editor/components/use-pointer-stroke";
import { useEffect, useState } from "react";

interface Preview {
  timeline: Timeline;
  item: TimelineItem;
  start: number;
  duration: number;
}

const rowHeight = 32;
const scale = 0.1;

export const TimelineArea: React.FC<{
  className?: string;
}> = observer(({ className }) => {
  const editorState = useEditorState();

  const [originalPreviewRows, setOriginalPreviewRows] = useState<Preview[][]>(
    []
  );
  const [currentPreviewRows, setCurrentPreviewRows] = useState<Preview[][]>([]);

  useEffect(() => {
    return reaction(
      () => {
        const timelines = editorState.document.currentSequence.timelines;

        return timelines.map((timeline) =>
          timeline.items.map((item) => ({
            timeline,
            item,
            start: item.data.start,
            duration: item.data.duration,
          }))
        );
      },
      (previewRows) => {
        setOriginalPreviewRows(previewRows);
        setCurrentPreviewRows(previewRows);
      },
      { fireImmediately: true }
    );
  }, [editorState]);

  return (
    <div
      className={twMerge("relative", className)}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {currentPreviewRows.flatMap((row, timelineIndex) => {
        return row.map((preview) => (
          <TimelineAreaItem
            key={preview.item.id}
            item={preview.item}
            start={preview.start}
            duration={preview.duration}
            timelineIndex={timelineIndex}
            onMoveStart={() => {
              // TODO
            }}
            onMove={(totalDeltaX, totalDeltaY) => {
              setCurrentPreviewRows(
                movePreviewRows(
                  originalPreviewRows,
                  preview,
                  totalDeltaX,
                  totalDeltaY
                )
              );
            }}
            onMoveEnd={action(() => {
              for (const row of currentPreviewRows) {
                for (const preview of row) {
                  const item = preview.item;

                  if (
                    item.data.start !== preview.start ||
                    item.data.duration !== preview.duration
                  ) {
                    item.data = {
                      ...item.data,
                      start: preview.start,
                      duration: preview.duration,
                    };
                  }
                }
              }
            })}
          />
        ));
      })}
    </div>
  );
});

function movePreviewRows(
  previewRows: Preview[][],
  movedItem: Preview,
  totalDeltaX: number,
  totalDeltaY: number
): Preview[][] {
  return previewRows.map((row) => {
    return row.map((preview) => {
      if (preview.item === movedItem.item) {
        return {
          ...preview,
          start: Math.max(0, preview.start + totalDeltaX / scale),
        };
      }
      return preview;
    });
  });
}

const TimelineAreaItem: React.FC<{
  item: TimelineItem;
  timelineIndex: number;
  start: number;
  duration: number;
  onMoveStart: () => void;
  onMove: (totalDeltaX: number, totalDeltaY: number) => void;
  onMoveEnd: () => void;
}> = observer(
  ({
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
