import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { TrackItemData } from "./schema";
import { Node } from "./node";
import { computed, makeObservable } from "mobx";
import { Track } from "./track";

export class TrackItem {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    this.store = document.trackItemStore;
    makeObservable(this);
  }

  @computed get data(): TrackItemData {
    return this.store.data.get(this.id)!;
  }

  set data(data: TrackItemData) {
    this.store.data.set(this.id, data);
  }

  @computed get node(): Node {
    return this.document.nodes.get(this.data.node);
  }

  @computed get selected(): boolean {
    // TODO: make efficient
    return this.document.selection.nodeRoots.has(this.node);
  }

  get track(): Track {
    return this.document.tracks.get(this.data.track);
  }

  set track(track: Track) {
    this.data = {
      ...this.data,
      track: track.id,
    };
  }

  get start(): number {
    return this.data.start;
  }

  set start(start: number) {
    this.data = {
      ...this.data,
      start,
    };
  }

  get trim(): number {
    return this.data.trim;
  }

  set trim(offset: number) {
    this.data = {
      ...this.data,
      trim: offset,
    };
  }

  get duration(): number {
    return this.data.duration;
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<string, TrackItemData>;
}
