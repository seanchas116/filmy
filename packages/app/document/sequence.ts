import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { SequenceData, TrackData } from "./schema";
import { Track } from "./track";
import { computed, makeObservable } from "mobx";
import { nanoid } from "nanoid";

export class Sequence {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    this.store = document.sequenceStore;
    makeObservable(this);
  }

  @computed get data(): SequenceData {
    return this.store.data.get(this.id)!;
  }

  set data(data: SequenceData) {
    this.store.data.set(this.id, data);
  }

  @computed get trackIDs(): string[] {
    return this.document.trackParenting.getChildren(this.id).items;
  }

  @computed get tracks(): Track[] {
    return this.trackIDs.map((id) => this.document.tracks.get(id));
  }

  prependTrack(data: Omit<TrackData, "sequence" | "order">) {
    return this.document.tracks.add(nanoid(), {
      ...data,
      sequence: this.id,
      order: (this.tracks[0]?.data.order ?? 0) - 1,
    });
  }

  appendTrack(data: Omit<TrackData, "sequence" | "order">) {
    return this.document.tracks.add(nanoid(), {
      ...data,
      sequence: this.id,
      order: (this.tracks[this.tracks.length - 1]?.data.order ?? 0) + 1,
    });
  }

  deleteUnusedTracks() {
    for (const track of this.tracks) {
      if (track.items.length === 0) {
        track.delete();
      }
    }
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<SequenceData>;
}
