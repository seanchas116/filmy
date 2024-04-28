import { Document } from "@/document/document";
import { makeObservable, observable } from "mobx";
import { ScrollState } from "./scroll-state";

export class EditorState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  @observable tool: "rectangle" | "ellipse" | "text" | undefined = undefined;

  // TODO

  readonly scroll = new ScrollState();

  commitUndo() {
    // TODO
  }

  get shouldHideResizeBox() {
    return false;
  }

  get isReadonly() {
    return false;
  }
}
