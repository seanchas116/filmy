import { Document } from "@/document/document";
import { action, computed, makeObservable, observable } from "mobx";
import { ScrollState } from "./scroll-state";

export class EditorState {
  constructor() {
    makeObservable(this);
  }

  readonly document = new Document();
  @observable tool: "rectangle" | "ellipse" | "text" | undefined = undefined;

  @observable mode: "design" | "animate" = "design";

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

  private playRangeTimeout = 0;

  playRange(start: number, duration: number, speed: number) {
    if (this.isPlaying) {
      this.pause();
    }

    if (this.playRangeTimeout) {
      clearInterval(this.playRangeTimeout);
      this.playRangeTimeout = 0;
    }

    this.currentTime = start;

    let time = start;

    const updateTime = action(() => {
      time += (1000 / 60) * speed;

      if (time >= start + duration) {
        this.currentTime = start + duration;
        clearInterval(this.playRangeTimeout);
        this.playRangeTimeout = 0;
      } else {
        this.currentTime = time;
      }
    });

    this.playRangeTimeout = setInterval(
      updateTime,
      1000 / 60
    ) as unknown as number;
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

  getTrackItemsForCurrentTime() {
    return this.document.currentSequence.tracks.flatMap((track) =>
      track.itemsAt(this.currentTime)
    );
  }
}
