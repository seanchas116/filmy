import { DataStore } from "./data-store";

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

export type NodeData = {
  type: "shape";
  shape: ShapeData;
  fill?: FillData;
  stroke?: StrokeData;
};

export type StoredData = {
  timelines?: {
    [id: string]: {
      order: number;
    };
  };

  timelineItems?: {
    [id: string]: {
      timelineId: string;
      start: number;
      duration: number;
      node: string;
    };
  };

  nodes?: {
    [id: string]: {
      parent?: string;
      order: number;
      data: NodeData;
    };
  };
};

export class Document {
  constructor() {
    const store = new DataStore<StoredData>();

    store.set(`timelines/${"0"}`, {
      order: 0,
    });

    store.set(`timelineItems/${"0"}`, {
      timelineId: "0",
      start: 0,
      duration: 1000,
      node: "0",
    });

    store.set(`nodes/${"0"}`, {
      order: 0,
      data: {
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

    store.onUpdate(`timelines`, (key, newValue, oldValue) => {
      // TODO
    });
  }
}
