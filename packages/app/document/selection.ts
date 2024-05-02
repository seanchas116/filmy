import { Store } from "@/utils/store/store";
import { Node } from "./node";
import { TrackItem } from "./track-item";
import { computed } from "mobx";
import { compact, flatMap } from "lodash-es";
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
    return flatMap([...this.nodeRoots].map((root) => root.trackItems));
  }

  deleteSelected() {
    const nodes = new Set(this.nodes);
    const trackItem = this.trackItems.at(0);
    const containingTrackItem =
      trackItem && !trackItem.selected ? trackItem : undefined;

    for (const node of nodes) {
      node.delete();
    }

    containingTrackItem?.node.select();
  }

  selectAllSiblings() {
    throw new Error("Not implemented");
  }
}
