import { Node } from "@/document/node";
import { TextNodeData } from "@/document/schema";
import { TrackItem } from "@/document/track-item";
import { EditorState } from "@/editor/state/editor-state";
import { assertNonNull } from "@/utils/assert";
import { clamp } from "@/utils/math";
import { autorun } from "mobx";

export class CurrentFrameRenderer {
  constructor(editorState: EditorState, canvas: HTMLCanvasElement) {
    this.renderer = new CompositionRenderer(canvas);
    this.editorState = editorState;
    this.disposers.push(
      autorun(() => {
        this.render();
      })
    );
  }

  readonly editorState: EditorState;
  readonly renderer: CompositionRenderer;
  private disposers: (() => void)[] = [];

  dispose() {
    for (const disposer of this.disposers) {
      disposer();
    }
    this.disposers = [];
  }

  render() {
    this.renderer.clear();

    const items = this.editorState.getTrackItemsForCurrentTime().toReversed();
    for (const item of items) {
      this.renderer.renderNode(
        item.node,
        item,
        this.editorState.currentTime,
        this.editorState.isPlaying
      );
    }
  }
}

const videos = new Map<string, HTMLVideoElement>();

export class CompositionRenderer {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = assertNonNull(this.canvas.getContext("2d"));
  }

  disposers: (() => void)[] = [];

  dispose() {
    for (const disposer of this.disposers) {
      disposer();
    }
    this.disposers = [];
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderNode(
    node: Node,
    trackItem: TrackItem,
    currentTime: number,
    isPlaying: boolean
  ) {
    for (const child of node.children) {
      this.renderNode(child, trackItem, currentTime, isPlaying);
    }

    const localTime = currentTime - trackItem.start;
    const data = node.animatedDataAt(localTime);

    if (data.type === "video") {
      let video = videos.get(node.id);
      if (!video) {
        video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.src = data.src;
        video.muted = true; // TODO: audio
        videos.set(node.id, video);
      }

      if (isPlaying && video.paused) {
        void video.play();
      }
      if (!isPlaying && !video.paused) {
        void video.pause();
      }

      const targetTime = (currentTime - trackItem.start - data.start) / 1000;
      const diff = Math.abs(video.currentTime - targetTime);
      // TODO: better seek precision (using requestVideoFrameCallback)
      if (diff >= 1 / 60) {
        video.currentTime = targetTime;
      }

      this.context.globalAlpha = data.opacity ?? 1;
      this.context.drawImage(video, data.x, data.y, data.w, data.h);
      return;
    }

    if (data.type === "rectangle") {
      this.context.globalAlpha = data.opacity ?? 1;
      this.context.fillStyle = data.fill?.hex ?? "none";
      this.context.fillRect(data.x, data.y, data.w, data.h);
      return;
    }

    if (data.type === "ellipse") {
      this.context.globalAlpha = data.opacity ?? 1;
      this.context.fillStyle = data.fill?.hex ?? "none";
      this.context.beginPath();
      this.context.ellipse(
        data.x + data.w / 2,
        data.y + data.h / 2,
        data.w / 2,
        data.h / 2,
        0,
        0,
        Math.PI * 2
      );
      this.context.fill();
      return;
    }

    if (data.type === "text") {
      this.context.globalAlpha = data.opacity ?? 1;
      this.context.font = `${data.font.size}px ${data.font.family}`;
      this.context.fillStyle = data.fill?.hex ?? "none";

      // TODO: control via animation
      new TextAppearAnimation().render(
        this.context,
        data,
        Math.min(1, localTime / 500)
      );

      return;
    }
  }

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

class TextAppearAnimation {
  constructor() {}

  render(
    context: CanvasRenderingContext2D,
    data: TextNodeData,
    progress: number
  ) {
    const charCount = data.text.length;
    let x = data.x;
    for (let i = 0; i < charCount; i++) {
      const char = data.text[i];
      const charProgress = clamp(progress * charCount - i, 0, 1);

      context.globalAlpha = charProgress;
      context.fillText(
        char,
        x,
        data.y + data.font.size + (1 - charProgress) * data.font.size
      );

      x += context.measureText(char).width;
    }
  }
}
