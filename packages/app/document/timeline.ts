import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { TimelineData } from "./schema";

export class Timeline {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    this.store = document.timelineStore;
  }

  get data(): TimelineData {
    return this.store.data.get(this.id)!;
  }

  set data(data: TimelineData) {
    this.store.data.set(this.id, data);
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<TimelineData>;
}
