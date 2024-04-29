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

  @observable currentTime = 0;
  @observable isPlaying = false;

  private lastFrameTime = 0;

  play() {
    this.isPlaying = true;
    this.lastFrameTime = Date.now();
    this.requestFrame();
  }

  private requestFrame() {
    requestAnimationFrame(() => {
      if (this.isPlaying) {
        const currentTime = Date.now();
        this.currentTime += currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.requestFrame();
      }
    });
  }

  pause() {
    this.isPlaying = false;
  }
}
