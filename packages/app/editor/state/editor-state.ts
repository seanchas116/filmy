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

  handleKeyDown(event: KeyboardEvent): boolean {
    // if (dialogState.isAnyOpen) {
    //   return false;
    // }

    if (event.key === " ") {
      this.panMode = true;
    }
    if (event.key === "Alt") {
      this.measureMode = true;
    }

    if (event.key === "Escape") {
      this.tool = undefined;
      return true;
    }

    // if (
    //   event.ctrlKey ||
    //   event.metaKey ||
    //   !isTextInput(document.activeElement)
    // ) {
    //   return this.handleCommand(event);
    // }

    return false;
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === " ") {
      this.panMode = false;
      this.togglePlay();
    }
    if (event.key === "Alt") {
      this.measureMode = false;
    }
  }

  @observable hoveredNodeID: string | undefined = undefined;

  @computed get hoveredNode() {
    if (this.hoveredNodeID) {
      return this.document.nodes.safeGet(this.hoveredNodeID);
    }
  }

  @computed get topmostSelectedGraphicRoot(): Node | undefined {
    const timelineItems = this.document.selectedTimelineItems;
    for (const timelineItem of timelineItems) {
      // TODO: use group
      if (timelineItem.node.type === "frame") {
        return timelineItem.node;
      }
    }
  }
}
