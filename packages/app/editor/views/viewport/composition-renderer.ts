import { Node } from "@/document/node";
import { InOutAnimationData, TextNodeData } from "@/document/schema";
import { TrackItem } from "@/document/track-item";
import { EditorState } from "@/editor/state/editor-state";
import { assertNonNull } from "@/utils/assert";
import { clamp } from "@/utils/math";
import { UnitBezier } from "@/utils/unit-bezier";
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
    const sequence = this.editorState.document.currentSequence;

    this.renderer.clear();
    this.renderer.context.scale(
      this.renderer.canvas.width / sequence.width,
      this.renderer.canvas.height / sequence.height
    );

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
    this.context.resetTransform();
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

      this.context.globalAlpha = (data.opacity ?? 100) / 100;
      this.context.drawImage(video, data.x, data.y, data.w, data.h);
      return;
    }

    const anchorX = data.x + (data.w * (data.transform?.anchorX ?? 50)) / 100;
    const anchorY = data.y + (data.h * (data.transform?.anchorY ?? 50)) / 100;

    this.context.globalAlpha = (data.opacity ?? 100) / 100;
    this.context.fillStyle = data.fill?.hex ?? "none";

    this.context.translate(anchorX, anchorY);

    this.context.translate(
      data.transform?.translateX ?? 0,
      data.transform?.translateY ?? 0
    );
    this.context.rotate((data.transform?.rotate ?? 0) * (Math.PI / 180));
    this.context.scale(
      (data.transform?.scaleX ?? 100) / 100,
      (data.transform?.scaleY ?? 100) / 100
    );

    this.context.translate(-anchorX, -anchorY);

    if (data.type === "rectangle") {
      this.context.fillRect(data.x, data.y, data.w, data.h);
      return;
    }

    if (data.type === "ellipse") {
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
      this.context.font = `${data.font.weight ?? 400} ${data.font.size}px ${data.font.family}`;

      const appearAnimations = node.animations
        .map((a) => a.data)
        .filter((a): a is InOutAnimationData => a.type === "in");

      // TODO: show all animations
      const appearAnimation = appearAnimations.at(0);
      if (appearAnimation) {
        const progress = clamp(
          (localTime - appearAnimation.start) / appearAnimation.duration,
          0,
          1
        );

        new TextAppearAnimation().render(this.context, data, progress);
      } else {
        new TextAppearAnimation().render(this.context, data, 1);
      }

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
      let charProgress = clamp(progress * charCount - i, 0, 1);

      const easing = new UnitBezier(0, 0, 0.58, 1); // ease-out
      charProgress = easing.solve(charProgress);

      context.globalAlpha = charProgress;

      context.save();

      const rotation = (1 - charProgress) * (Math.PI * 0.25);

      context.translate(
        x,
        data.y + data.font.size + (1 - charProgress) * data.font.size
      );
      context.rotate(-rotation);

      context.fillText(char, 0, 0);

      context.restore();

      x += context.measureText(char).width;
    }
  }
}
