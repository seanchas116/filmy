import { Track } from "@/document/track";
import { TrackItem } from "@/document/track-item";
import { EditorState } from "@/editor/state/editor-state";
import { makeObservable, observable } from "mobx";

export interface Preview {
  item: TrackItem;
  start: number;
  duration: number;
}

export interface PreviewRow {
  track: Track;
  previews: Preview[];
}

export class TimelineAreaState {
  constructor(editorState: EditorState) {
    this.editorState = editorState;
    makeObservable(this);
  }

  readonly editorState: EditorState;

  private get previewRows(): PreviewRow[] {
    const tracks = this.editorState.document.currentSequence.tracks;

    return tracks.map((track) => ({
      track,
      previews: track.items.map((item) => ({
        item,
        start: item.data.start,
        duration: item.data.duration,
      })),
    }));
  }

  private initialPreviewRows: PreviewRow[] | undefined = undefined;
  @observable.ref private ongoingPreviewRows: PreviewRow[] | undefined =
    undefined;
  private prependedTrack: Track | undefined = undefined;
  private appendedTrack: Track | undefined = undefined;

  private createPrependedTrack(): Track {
    if (!this.prependedTrack) {
      this.prependedTrack =
        this.editorState.document.currentSequence.prependTrack({
          name: "Track",
        });
    }
    return this.prependedTrack;
  }

  private createAppendedTrack(): Track {
    if (!this.appendedTrack) {
      this.appendedTrack =
        this.editorState.document.currentSequence.appendTrack({
          name: "Track",
        });
    }
    return this.appendedTrack;
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
    this.prependedTrack = undefined;
    this.appendedTrack = undefined;
    this.editorState.document.currentSequence.deleteUnusedTracks();
    this.editorState.document.undoManager.commit();
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
        track: this.createPrependedTrack(),
        previews: [newPreview],
      });
    } else if (nextRowIndex >= previewRows.length) {
      newRows.push({
        track: this.createAppendedTrack(),
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

        if (row.track !== item.track) {
          item.track = row.track;
        }
      }
    }
  }
}
