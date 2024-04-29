import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { TimelineData } from "./schema";
import { TimelineItem } from "./timeline-item";

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

  get items(): TimelineItem[] {
    return this.document.timelineItemParenting
      .getChildren(this.id)
      .items.map((id) => this.document.timelineItems.get(id));
  }

  itemsAt(time: number): TimelineItem[] {
    // todo: optimize
    return this.items.filter(
      (item) =>
        item.data.start <= time && time < item.data.start + item.data.duration
    );
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<TimelineData>;
}
