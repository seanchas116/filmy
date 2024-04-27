import { Document } from "@/document/document";
import { Node } from "@/document/node";
import { compact } from "lodash-es";
import { computed, makeObservable, observable } from "mobx";
import { ScrollState } from "./scroll-state";

export class EditorState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  @observable tool: "rectangle" | "ellipse" | "text" | undefined = undefined;

  readonly selectedNodeIds = observable.set<string>();

  @computed get selectedNodes(): Node[] {
    return compact(
      [...this.selectedNodeIds].map((id) => this.document.nodes.safeGet(id))
    );
  }

  // TODO

  readonly scroll = new ScrollState();

  commitUndo() {
    // TODO
  }

  get shouldHideResizeBox() {
    return false;
  }

  get isReadOnly() {
    return false;
  }
}
