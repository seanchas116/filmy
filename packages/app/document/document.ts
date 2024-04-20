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

export interface StoredData {
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
}
