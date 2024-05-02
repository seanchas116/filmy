import { Timeline } from "@/document/timeline";
import { TimelineItem } from "@/document/timeline-item";
import { EditorState } from "@/editor/state/editor-state";
import { makeObservable, observable } from "mobx";

export interface Preview {
  timeline: Timeline;
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
    _totalDeltaY: number
  ): Preview[][] {
    return previewRows.map((row) => {
      return row.map((preview) => {
        if (preview.item.id === movedItemID) {
          return {
            ...preview,
            start: Math.max(0, preview.start + totalDeltaX / this.scale),
          };
        }
        return preview;
      });
    });
  }

  private applyPreviewRows(previewRows: Preview[][]) {
    for (const row of previewRows) {
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
  }
}
