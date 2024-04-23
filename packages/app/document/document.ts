import { Collection } from "@/utils/store";

export type ShapeData =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "rectangle";
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      type: "ellipse";
      x: number;
      y: number;
      w: number;
      h: number;
    };

export type ColorData = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type FillData = {
  type: "solid";
  color: ColorData;
};

export type StrokeData = {
  width: number;
  fill: FillData;
};

export type NodeDetailData = {
  type: "shape";
  shape: ShapeData;
  fill?: FillData;
  stroke?: StrokeData;
};

export type TimelineData = {
  order: number;
};

export type TimelineItemData = {
  timeline: string;
  start: number;
  duration: number;
  node: string;
};

export type NodeData = {
  parent?: string;
  order: number;
  detail: NodeDetailData;
};

export class Document {
  constructor() {
    const timelines = new Collection<TimelineData>();

    timelines.data.set("timeline0", {
      order: 0,
    });

    const timelineItems = new Collection<TimelineItemData>();

    timelineItems.data.set("timelineItem0", {
      timeline: "timeline0",
      start: 0,
      duration: 1000,
      node: "node0",
    });

    const nodes = new Collection<NodeData>();

    nodes.data.set("node0", {
      parent: "timelineItem0",
      order: 0,
      detail: {
        type: "shape",
        shape: { type: "rectangle", x: 0, y: 0, w: 100, h: 100 },
        fill: {
          type: "solid",
          color: { r: 255, g: 0, b: 0, a: 1 },
        },
        stroke: {
          width: 1,
          fill: {
            type: "solid",
            color: { r: 0, g: 0, b: 0, a: 1 },
          },
        },
      },
    });
  }
}
