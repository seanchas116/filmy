import { computed, makeObservable } from "mobx";
import { Document } from "./document";
import { Node } from "./node";
import { AnimationData } from "./schema";

export class Animation {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
    makeObservable(this);
  }

  @computed get data(): AnimationData {
    return this.document.animationStore.data.get(this.id)!;
  }

  set data(data: AnimationData) {
    this.document.animationStore.data.set(this.id, data);
  }

  @computed get node(): Node {
    return this.document.nodes.get(this.data.node);
  }

  delete() {
    this.document.animationStore.data.delete(this.id);
  }

  select() {
    this.document.selectedAnimationIDStore.data.set(this.id, true);
  }

  deselect() {
    this.document.selectedAnimationIDStore.data.delete(this.id);
  }

  @computed get selected(): boolean {
    return this.document.selectedAnimationIDStore.data.has(this.id);
  }

  readonly id: string;
  readonly document: Document;
}
