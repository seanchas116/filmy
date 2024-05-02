import { TimelineItem } from "@/document/timeline-item";
import { EditorState } from "@/editor/state/editor-state";
import { makeObservable, observable } from "mobx";

export interface Preview {
  item: TimelineItem;
  start: number;
  duration: number;
}

export class TimelineAreaState {
  constructor(editorState: EditorState) {
    this.editorState = editorState;
    makeObservable(this);
  }

  readonly editorState: EditorState;

  private get previewRows() {
    const timelines = this.editorState.document.currentSequence.timelines;

    return timelines.map((timeline) =>
      timeline.items.map((item) => ({
        timeline,
        item,
        start: item.data.start,
        duration: item.data.duration,
      }))
    );
  }

  private initialPreviewRows: Preview[][] | undefined = undefined;
  @observable.ref private ongoingPreviewRows: Preview[][] | undefined =
    undefined;

  move(itemID: string, totalDeltaX: number, totalDeltaY: number) {
    if (!this.initialPreviewRows) {
      this.initialPreviewRows = this.previewRows;
    }

    this.ongoingPreviewRows = this.movePreviewRows(
      this.initialPreviewRows,
      itemID,
      totalDeltaX,
      totalDeltaY
    );
    this.applyPreviewRows(this.ongoingPreviewRows);
  }

  end() {
    this.initialPreviewRows = undefined;
    this.ongoingPreviewRows = undefined;
  }

  get rowsToShow() {
    return this.ongoingPreviewRows ?? this.previewRows;
  }

  readonly rowHeight = 32;
  readonly scale = 0.1;

  private movePreviewRows(
    previewRows: Preview[][],
    movedItemID: string,
    totalDeltaX: number,
    totalDeltaY: number
  ): Preview[][] {
    let preview: Preview | undefined;
    let previewRowIndex = 0;
    // find preview
    for (const [i, row] of previewRows.entries()) {
      preview = row.find((preview) => preview.item.id === movedItemID);
      if (preview) {
        previewRowIndex = i;
        break;
      }
    }
    if (!preview) {
      return previewRows;
    }

    const nextRowIndex = clamp(
      previewRowIndex + Math.round(totalDeltaY / this.rowHeight),
      0,
      previewRows.length - 1
    );
    console.log(totalDeltaY);
    const resultRows = [];

    for (let i = 0; i < previewRows.length; i++) {
      const row = [
        ...previewRows[i].filter((preview) => preview.item.id !== movedItemID),
      ];
      if (i === nextRowIndex) {
        row.push({
          ...preview,
          start: Math.max(0, preview.start + totalDeltaX / this.scale),
        });
      }
      resultRows.push(row);
    }

    return resultRows;
  }

  private applyPreviewRows(previewRows: Preview[][]) {
    const timelines = this.editorState.document.currentSequence.timelines;

    for (const [timelineIndex, row] of previewRows.entries()) {
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

        if (timelines[timelineIndex] !== item.timeline) {
          item.timeline = timelines[timelineIndex];
        }
      }
    }
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
