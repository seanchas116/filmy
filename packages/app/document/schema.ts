export type PropertyAnimationData = {
  // property animation
  type: "property";
  property: string;
  start: number;
  duration: number;
  easing: string;
  from?: number;
  to: number;
  node: string;
};
export type InOutAnimationData = {
  // in or out animation (such as text appearing)
  type: "in" | "out";
  filter: string;
  start: number;
  duration: number;
  node: string;
};

export type AnimationData = PropertyAnimationData | InOutAnimationData;

export type NodeCommonData = {
  readonly parent?: string;
  readonly order: number;

  readonly name?: string;
  readonly hidden?: boolean;
  readonly locked?: boolean;

  readonly fill?: FillData;
  readonly stroke?: StrokeData;
  readonly opacity?: number;

  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export type FontData = {
  readonly family: string;
  readonly size: number;
  readonly weight?: number;
  readonly style?: string;
};

export type FillData = {
  readonly type: "solid";
  readonly hex: string; // #RRGGBB
};

export type StrokeData = {
  readonly width: number;
  readonly fill: FillData;
};

export type TextNodeData = NodeCommonData & {
  readonly type: "text";
  readonly text: string;
  readonly font: FontData;
};

export type RectangleNodeData = NodeCommonData & {
  readonly type: "rectangle";
};

export type EllipseNodeData = NodeCommonData & {
  readonly type: "ellipse";
};

export type VideoNodeData = NodeCommonData & {
  readonly type: "video";
  readonly src: string;
  readonly start: number;
};

export type GroupNodeData = NodeCommonData & {
  readonly type: "group";
};

export type NodeData =
  | TextNodeData
  | RectangleNodeData
  | EllipseNodeData
  | VideoNodeData
  | GroupNodeData;

export type TrackData = {
  readonly sequence: string;
  readonly order: number;
  readonly name: string;
};

export type TrackItemData = {
  readonly track: string;
  readonly start: number;
  readonly duration: number;
};

export type SequenceData = {
  readonly name: string;
  readonly order: number;
  readonly w: number;
  readonly h: number;
};
