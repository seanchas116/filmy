import { Mutex } from "async-mutex";
import { getOrCreate } from "./get-or-create";

export interface VideoThumbnailFrame {
  timestamp: number;
  dataURL: string;
}

export class VideoThumbnail {
  constructor(src: string, width: number, height: number) {
    this.src = src;
    this.width = width;
    this.height = height;

    // generate thumbnails
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d")!;
  }

  readonly src: string;
  readonly width: number;
  readonly height: number;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private video: HTMLVideoElement | undefined;
  private readonly mutex = new Mutex();
  private readonly cache = new Map<number, Promise<VideoThumbnailFrame>>();

  getAt(time: number): Promise<VideoThumbnailFrame> {
    const second = Math.round(time);
    return getOrCreate(this.cache, second, () => this.getAtImpl(second));
  }

  private async getAtImpl(time: number): Promise<VideoThumbnailFrame> {
    return await this.mutex.runExclusive(async () => {
      const video = await this.loadVideo();
      const { context, canvas } = this;

      video.currentTime = time;
      await new Promise((resolve) => {
        video.addEventListener("seeked", resolve);
      });

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      return {
        timestamp: time,
        dataURL: canvas.toDataURL(),
      };
    });
  }

  private async loadVideo(): Promise<HTMLVideoElement> {
    if (this.video) {
      return this.video;
    }

    // wait for video to load
    const video = document.createElement("video");
    video.src = this.src;
    video.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      video.addEventListener("loadeddata", resolve);
    });
    this.video = video;
    return video;
  }
}
