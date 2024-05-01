import { Node } from "@/document/node";
import { EditorState } from "@/editor/state/editor-state";
import { assertNonNull } from "@/utils/assert";
import { autorun } from "mobx";

export class CompositionRenderer {
  constructor(editorState: EditorState, canvas: HTMLCanvasElement) {
    this.editorState = editorState;
    this.canvas = canvas;
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.context = assertNonNull(this.canvas.getContext("2d"));

    this.disposers.push(
      autorun(() => {
        this.render();
      })
    );
  }

  disposers: (() => void)[] = [];

  dispose() {
    for (const disposer of this.disposers) {
      disposer();
    }
    this.disposers = [];
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const nodes = this.editorState.document.currentSequence.timelines
      .toReversed()
      .flatMap((timeline) => timeline.itemsAt(this.editorState.currentTime))
      .map((item) => item.node);

    for (const node of nodes) {
      this.renderNode(node);
    }
  }

  renderNode(node: Node) {
    for (const child of node.children) {
      this.renderNode(child);
    }

    const data = node.data;

    if (data.type === "video") {
      let video = this.videos.get(node.id);
      if (!video) {
        video = document.createElement("video");
        video.src = data.src;
        this.videos.set(node.id, video);
      }

      const isPlaying = this.editorState.isPlaying;
      if (isPlaying && video.paused) {
        void video.play();
      }
      if (!isPlaying && !video.paused) {
        void video.pause();
      }

      const targetTime = (this.editorState.currentTime + data.offset) / 1000;
      const diff = Math.abs(video.currentTime - targetTime);
      // TODO: better seek precision (using requestVideoFrameCallback)
      if (diff >= 1) {
        video.currentTime = targetTime;
      }

      this.context.drawImage(video, data.x, data.y, data.w, data.h);
      return;
    }

    if (data.type === "rectangle") {
      this.context.fillStyle = data.fill?.hex ?? "none";
      this.context.fillRect(data.x, data.y, data.w, data.h);
      return;
    }

    if (data.type === "ellipse") {
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
      this.context.font = `${data.font.size}px ${data.font.family}`;
      this.context.fillStyle = data.fill?.hex ?? "none";
      this.context.fillText(data.text, data.x, data.y + data.font.size);
      return;
    }
  }

  editorState: EditorState;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  videos = new Map<string, HTMLVideoElement>();
}
