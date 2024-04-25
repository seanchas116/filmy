export type ShapeData =
  | {
      readonly type: "text";
      readonly text: string;
      readonly x: number;
      readonly y: number;
    }
  | {
      readonly type: "rectangle";
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly h: number;
    }
  | {
      readonly type: "ellipse";
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly h: number;
    };

export type ColorData = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

export type FillData = {
  readonly type: "solid";
  readonly color: ColorData;
};

export type StrokeData = {
  readonly width: number;
  readonly fill: FillData;
};

export type NodeDetailData = {
  readonly type: "shape";
  readonly shape: ShapeData;
  readonly fill?: FillData;
  readonly stroke?: StrokeData;
};

export type TimelineData = {
  readonly order: number;
};

export type TimelineItemData = {
  readonly timeline: string;
  readonly start: number;
  readonly duration: number;
  readonly node: string;
};

export type NodeData = {
  readonly parent?: string;
  readonly order: number;
  readonly detail: NodeDetailData;
};
