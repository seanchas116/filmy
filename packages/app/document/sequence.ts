import { Store } from "@/utils/store/store";
import { Document } from "./document";
import { SequenceData } from "./schema";
import { Timeline } from "./timeline";
import { computed, makeObservable } from "mobx";

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

  readonly id: string;
  readonly document: Document;
  readonly store: Store<SequenceData>;
}
