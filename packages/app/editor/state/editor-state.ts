import { Document } from "@/document/document";
import { action, computed, makeObservable, observable } from "mobx";
import { ScrollState } from "./scroll-state";
import { Node } from "@/document/node";

export class EditorState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  @observable tool: "rectangle" | "ellipse" | "text" | undefined = undefined;

  // TODO

  readonly scroll = new ScrollState();

  get shouldHideResizeBox() {
    return false;
  }

  get isReadonly() {
    return false;
  }

  @observable currentTime = 0;
  @observable isPlaying = false;
  @observable isSeeking = false;

  private lastFrameTime = 0;

  play() {
    this.isPlaying = true;
    this.lastFrameTime = Date.now();
    this.requestFrame();
  }

  private requestFrame() {
    requestAnimationFrame(
      action(() => {
        if (this.isPlaying) {
          const currentTime = Date.now();
          if (!this.isSeeking) {
            this.currentTime += currentTime - this.lastFrameTime;
          }
          this.lastFrameTime = currentTime;
          this.requestFrame();
        }
      })
    );
  }

  pause() {
    this.isPlaying = false;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  @observable panMode = false;
  @observable measureMode = false;

  @observable hoveredNodeID: string | undefined = undefined;

  @computed get hoveredNode() {
    if (this.hoveredNodeID) {
      return this.document.nodes.safeGet(this.hoveredNodeID);
    }
  }

  @computed get topmostSelectedGraphicRoot(): Node | undefined {
    const trackItems = this.document.selection.trackItems;
    for (const item of trackItems) {
      // TODO: use group
      if (item.node.type === "frame") {
        return item.node;
      }
    }
  }
}
