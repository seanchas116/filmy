import { Node } from "@/document/node";
import { TextAnimationData, TextNodeData } from "@/document/schema";
import { TrackItem } from "@/document/track-item";
import { EditorState } from "@/editor/state/editor-state";
import { assertNonNull } from "@/utils/assert";
import { clamp } from "@/utils/math";
import { UnitBezier, linear } from "@/utils/easing";
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

    this.context.save();
    this.renderNodeShape(node, trackItem, currentTime, isPlaying);
    this.context.restore();
  }

  renderNodeShape(
    node: Node,
    trackItem: TrackItem,
    currentTime: number,
    isPlaying: boolean
  ) {
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

    const anchorX = data.x + (data.w * (data.anchorX ?? 50)) / 100;
    const anchorY = data.y + (data.h * (data.anchorY ?? 50)) / 100;

    this.context.globalAlpha = (data.opacity ?? 100) / 100;
    this.context.fillStyle = data.fill?.hex ?? "none";

    this.context.translate(anchorX, anchorY);

    this.context.translate(data.translateX ?? 0, data.translateY ?? 0);
    this.context.rotate((data.rotate ?? 0) * (Math.PI / 180));
    this.context.scale((data.scaleX ?? 100) / 100, (data.scaleY ?? 100) / 100);

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
      this.context.font = `${data.fontWeight ?? 400} ${data.fontSize}px ${data.fontFamily}`;

      const textAnimation = node.animations
        .map((a) => a.data)
        .find(
          (a): a is TextAnimationData =>
            a.type === "text" &&
            a.start <= localTime &&
            localTime <= a.start + a.duration
        );

      if (textAnimation) {
        const progress = clamp(
          (localTime - textAnimation.start) / textAnimation.duration,
          0,
          1
        );
        const easing = new UnitBezier(...textAnimation.easing);

        if (textAnimation.mode === "in") {
          new TextAnimationRenderer().render(
            this.context,
            data,
            textAnimation,
            0,
            easing.solve(progress)
          );
        } else {
          new TextAnimationRenderer().render(
            this.context,
            data,
            textAnimation,
            easing.solve(progress),
            1
          );
        }
      } else {
        new TextAnimationRenderer().render(
          this.context,
          data,
          { translateX: 0, translateY: 0, rotate: 0, scale: 1, easing: linear },
          0,
          1
        );
      }

      return;
    }
  }

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

class TextAnimationRenderer {
  constructor() {}

  render(
    context: CanvasRenderingContext2D,
    data: TextNodeData,
    config: {
      readonly translateX: number;
      readonly translateY: number;
      readonly rotate: number;
      readonly scale: number;
      readonly easing: readonly [number, number, number, number];
    },
    showBegin: number,
    showEnd: number
  ) {
    const lines = data.text.split("\n");
    const charCount = lines
      .map((line) => line.length)
      .reduce((a, b) => a + b, 0);

    const lineHeight = data.fontSize * ((data.lineHeight ?? 100) / 100);

    let y = data.y + lineHeight - (lineHeight - data.fontSize) / 2;
    let charIndex = 0;

    for (const line of lines) {
      let x = data.x;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const charStart = clamp(showBegin * charCount - charIndex, 0, 1);
        const charEnd = clamp(showEnd * charCount - charIndex, 0, 1);
        const charProgress = clamp(charEnd - charStart, 0, 1);

        const easing = new UnitBezier(...config.easing);
        const ratio = easing.solve(charProgress);

        context.globalAlpha = ratio;

        context.save();

        const rotation = (1 - ratio) * ((config.rotate / 180) * Math.PI);

        context.translate(
          x + (1 - ratio) * config.translateX,
          y + (1 - ratio) * config.translateY
        );
        context.rotate(-rotation);

        context.fillText(char, 0, 0);

        context.restore();

        x += context.measureText(char).width;
        charIndex++;
      }

      y += lineHeight;
    }
  }
}
