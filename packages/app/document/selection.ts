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
  readonly selectedNodeIDStore: Store<string, true>;

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

  @computed get currentScene(): TrackItem | undefined {
    const id = this.document.currentSceneStore.data.get("value");
    if (id) {
      const trackItem = this.document.trackItems.safeGet(id);
      if (trackItem?.node.type === "group") {
        return trackItem;
      }
    }
  }

  @computed get nodeRoots(): Set<Node> {
    return new Set(this.nodes.map((node) => node.root));
  }

  @computed get trackItems(): TrackItem[] {
    return compact([...this.nodeRoots].map((root) => root.trackItem));
  }

  deleteSelected() {
    for (const node of this.nodes) {
      node.delete();
    }
  }

  selectAllSiblings() {
    throw new Error("Not implemented");
  }
}
