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
  private prependedTimeline: Timeline | undefined = undefined;
  private appendedTimeline: Timeline | undefined = undefined;

  private createPrependedTimeline(): Timeline {
    if (!this.prependedTimeline) {
      this.prependedTimeline =
        this.editorState.document.currentSequence.prependTimeline({
          name: "New Timeline",
        });
    }
    return this.prependedTimeline;
  }

  private createAppendedTimeline(): Timeline {
    if (!this.appendedTimeline) {
      this.appendedTimeline =
        this.editorState.document.currentSequence.appendTimeline({
          name: "New Timeline",
        });
    }
    return this.appendedTimeline;
  }

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
    this.prependedTimeline = undefined;
    this.appendedTimeline = undefined;
    this.editorState.document.currentSequence.deleteUnusedTimelines();
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

    const newPreview: Preview = {
      ...preview,
      start: Math.max(0, preview.start + totalDeltaX / this.scale),
    };

    const nextRowIndex =
      previewRowIndex + Math.round(totalDeltaY / this.rowHeight);
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
        newRow.previews.push(newPreview);
      }
      newRows.push(newRow);
    }

    if (nextRowIndex < 0) {
      newRows.unshift({
        timeline: this.createPrependedTimeline(),
        previews: [newPreview],
      });
    } else if (nextRowIndex >= previewRows.length) {
      newRows.push({
        timeline: this.createAppendedTimeline(),
        previews: [newPreview],
      });
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
