import { Document } from "@/document/document";
import { makeObservable, observable } from "mobx";

export class EditorState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  @observable tool: "rectangle" | "ellipse" | "text" | undefined = undefined;
}
