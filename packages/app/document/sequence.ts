import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { SequenceData, TimelineData } from "./schema";
import { Timeline } from "./timeline";
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

  @computed get timelineIDs(): string[] {
    return this.document.timelineParenting.getChildren(this.id).items;
  }

  @computed get timelines(): Timeline[] {
    return this.timelineIDs.map((id) => this.document.timelines.get(id));
  }

  prependTimeline(data: Omit<TimelineData, "sequence" | "order">) {
    return this.document.timelines.add(nanoid(), {
      ...data,
      sequence: this.id,
      order: (this.timelines[0]?.data.order ?? 0) - 1,
    });
  }

  appendTimeline(data: Omit<TimelineData, "sequence" | "order">) {
    return this.document.timelines.add(nanoid(), {
      ...data,
      sequence: this.id,
      order: (this.timelines[this.timelines.length - 1]?.data.order ?? 0) + 1,
    });
  }

  readonly id: string;
  readonly document: Document;
  readonly store: Store<SequenceData>;
}
