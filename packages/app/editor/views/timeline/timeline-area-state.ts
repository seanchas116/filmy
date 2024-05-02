import { Timeline } from "@/document/timeline";
import { TimelineItem } from "@/document/timeline-item";
import { EditorState } from "@/editor/state/editor-state";
import { makeObservable, observable } from "mobx";

export interface Preview {
  item: TimelineItem;
  start: number;
  duration: number;
}

export interface PreviewRow {
  timeline: Timeline;
  previews: Preview[];
}

export class TimelineAreaState {
  constructor(editorState: EditorState) {
    this.editorState = editorState;
    makeObservable(this);
  }

  readonly editorState: EditorState;

  private get previewRows(): PreviewRow[] {
    const timelines = this.editorState.document.currentSequence.timelines;

    return timelines.map((timeline) => ({
      timeline,
      previews: timeline.items.map((item) => ({
        timeline,
        item,
        start: item.data.start,
        duration: item.data.duration,
      })),
    }));
  }

  private initialPreviewRows: PreviewRow[] | undefined = undefined;
  @observable.ref private ongoingPreviewRows: PreviewRow[] | undefined =
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
    previewRows: PreviewRow[],
    movedItemID: string,
    totalDeltaX: number,
    totalDeltaY: number
  ): PreviewRow[] {
    let preview: Preview | undefined;
    let previewRowIndex = 0;
    // find preview
    for (const [i, row] of previewRows.entries()) {
      preview = row.previews.find((preview) => preview.item.id === movedItemID);
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
    const newRows: PreviewRow[] = [];

    for (let i = 0; i < previewRows.length; i++) {
      const row = previewRows[i];
      const newRow = {
        ...row,
        previews: row.previews.filter(
          (preview) => preview.item.id !== movedItemID
        ),
      };
      if (i === nextRowIndex) {
        newRow.previews.push({
          ...preview,
          start: Math.max(0, preview.start + totalDeltaX / this.scale),
        });
      }
      newRows.push(newRow);
    }

    return newRows;
  }

  private applyPreviewRows(previewRows: PreviewRow[]) {
    for (const row of previewRows) {
      for (const preview of row.previews) {
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

        if (row.timeline !== item.timeline) {
          item.timeline = row.timeline;
        }
      }
    }
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
