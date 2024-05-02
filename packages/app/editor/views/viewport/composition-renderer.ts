import { Node } from "@/document/node";
import { TrackItem } from "@/document/track-item";
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

    const items = this.editorState.document.currentSequence.tracks
      .toReversed()
      .flatMap((track) => track.itemsAt(this.editorState.currentTime));

    for (const item of items) {
      this.renderNode(item.node, item);
    }
  }

  renderNode(node: Node, trackItem: TrackItem) {
    for (const child of node.children) {
      this.renderNode(child, trackItem);
    }

    const data = node.data;

    if (data.type === "video") {
      let video = this.videos.get(node.id);
      if (!video) {
        video = document.createElement("video");
        video.src = data.src;
        video.muted = true; // TODO: audio
        this.videos.set(node.id, video);
      }

      const isPlaying = this.editorState.isPlaying;
      if (isPlaying && video.paused) {
        void video.play();
      }
      if (!isPlaying && !video.paused) {
        void video.pause();
      }

      const targetTime = (this.editorState.currentTime + trackItem.trim) / 1000;
      const diff = Math.abs(video.currentTime - targetTime);
      // TODO: better seek precision (using requestVideoFrameCallback)
      if (diff >= 1 / 60) {
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
