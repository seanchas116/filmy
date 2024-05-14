import { Node } from "./node";
import { TrackItem } from "./track-item";
import { computed } from "mobx";
import { compact } from "lodash-es";
import { Document } from "./document";
import { Animation } from "./animation";

export class Selection {
  constructor(document: Document) {
    this.document = document;
  }

  readonly document: Document;

  clear(): void {
    this.document.selectedNodeIDStore.data.clear();
    this.document.selectedAnimationIDStore.data.clear();
  }

  @computed get nodes(): Node[] {
    return compact(
      [...this.document.selectedNodeIDStore.data.keys()].map((id) =>
        this.document.nodes.safeGet(id)
      )
    );
  }

  @computed get animations(): Animation[] {
    return compact(
      [...this.document.selectedAnimationIDStore.data.keys()].map((id) =>
        this.document.animations.safeGet(id)
      )
    );
  }

  @computed get currentScene(): TrackItem | undefined {
    const id = this.document.currentSceneStore.data.get("value");
    if (id) {
      return this.document.trackItems.safeGet(id);
    }
  }

  clearCurrentScene(): void {
    this.document.currentSceneStore.data.delete("value");
  }

  @computed get nodeRoots(): Set<Node> {
    return new Set(this.nodes.map((node) => node.root));
  }

  @computed get trackItems(): TrackItem[] {
    return compact([...this.nodeRoots].map((root) => root.trackItem));
  }

  deleteSelected() {
    const animations = this.animations;
    if (animations.length) {
      for (const animation of animations) {
        animation.delete();
      }
      return;
    }

    for (const node of this.nodes) {
      node.delete();
    }
  }

  selectAllSiblings() {
    throw new Error("Not implemented");
  }
}
