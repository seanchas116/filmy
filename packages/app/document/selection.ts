import { Store } from "@/utils/store/store";
import { Node } from "./node";
import { TrackItem } from "./track-item";
import { computed } from "mobx";
import { compact } from "lodash-es";
import { Document } from "./document";

export class Selection {
  constructor(document: Document) {
    this.document = document;
    this.selectedNodeIDStore = document.selectedNodeIDStore;
  }

  readonly document: Document;
  readonly selectedNodeIDStore: Store<true>;

  clear(): void {
    this.selectedNodeIDStore.data.clear();
  }

  @computed get nodes(): Node[] {
    return compact(
      [...this.selectedNodeIDStore.data.keys()].map((id) =>
        this.document.nodes.safeGet(id)
      )
    );
  }

  @computed get nodeRoots(): Set<Node> {
    return new Set(this.nodes.map((node) => node.root));
  }

  @computed get trackItems(): TrackItem[] {
    return compact([...this.nodeRoots].map((root) => root.trackItem));
  }

  deleteSelected() {
    for (const node of this.nodes) {
      if (node.parent) {
        node.deleteRecursive();
      }
    }

    for (const trackItem of this.trackItems) {
      trackItem.delete();
    }
  }

  selectAllSiblings() {
    throw new Error("Not implemented");
  }
}
