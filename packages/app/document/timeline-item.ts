import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { TimelineItemData } from "./schema";
import { Node } from "./node";

export class TimelineItem {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    this.store = document.timelineItemStore;
  }

  get data(): TimelineItemData {
    return this.store.data.get(this.id)!;
  }

  set data(data: TimelineItemData) {
    this.store.data.set(this.id, data);
  }

  get node(): Node {
    return this.document.nodes.get(this.data.node);
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<TimelineItemData>;
}
