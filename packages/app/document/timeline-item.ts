import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { TimelineItemData } from "./schema";
import { Node } from "./node";
import { computed, makeObservable } from "mobx";

export class TimelineItem {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    this.store = document.timelineItemStore;
    makeObservable(this);
  }

  @computed get data(): TimelineItemData {
    return this.store.data.get(this.id)!;
  }

  set data(data: TimelineItemData) {
    this.store.data.set(this.id, data);
  }

  @computed get node(): Node {
    return this.document.nodes.get(this.data.node);
  }

  @computed get selected(): boolean {
    // TODO: make efficient
    return this.document.selection.nodeRoots.has(this.node);
  }

  delete() {
    this.node.deleteRecursive();
    this.store.data.delete(this.id);
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<TimelineItemData>;
}
