import { Document } from "@/document/document";
import { Node } from "@/document/node";
import { compact } from "lodash-es";
import { computed, makeObservable, observable } from "mobx";

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
}
