import { Document } from "./document";
import { Node } from "./node";
import { AnimationData } from "./schema";

export class Animation {
  constructor(document: Document, id: string) {
    this.id = id;
    this.document = document;
  }

  get data(): AnimationData {
    return this.document.animationStore.data.get(this.id)!;
  }

  set data(data: AnimationData) {
    this.document.animationStore.data.set(this.id, data);
  }

  get node(): Node {
    return this.document.nodes.get(this.data.node);
  }

  delete() {
    this.document.animationStore.data.delete(this.id);
  }

  readonly id: string;
  readonly document: Document;
}
