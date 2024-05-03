import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { TrackData } from "./schema";
import { TrackItem } from "./track-item";

export class Track {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    this.store = document.trackStore;
  }

  get data(): TrackData {
    return this.store.data.get(this.id)!;
  }

  set data(data: TrackData) {
    this.store.data.set(this.id, data);
  }

  get items(): TrackItem[] {
    return this.document.trackItemParenting
      .getChildren(this.id)
      .items.map((id) => this.document.trackItems.get(id));
  }

  itemsAt(time: number): TrackItem[] {
    // todo: optimize
    return this.items.filter(
      (item) =>
        item.data.start <= time && time < item.data.start + item.data.duration
    );
  }

  delete() {
    const nodes = new Set(this.items.map((item) => item.node));
    for (const node of nodes) {
      node.delete();
    }
    this.store.data.delete(this.id);
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<string, TrackData>;
}
