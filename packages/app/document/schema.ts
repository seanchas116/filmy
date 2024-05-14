export type AnimationCommonData = {
  readonly node: string;
  readonly order: number;
  readonly start: number;
  readonly duration: number;
};

export type PropertyAnimationData = AnimationCommonData & {
  // property animation
  readonly type: "property";
  readonly property: string;
  readonly easing: string;
  readonly from?: number;
  readonly to: number;
};
export type InOutAnimationData = AnimationCommonData & {
  // in or out animation (such as text appearing)
  readonly type: "in" | "out";
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
  readonly opacity?: number; // percentage
  readonly transform?: TransformData;

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

export type TransformData = {
  readonly translateX?: number;
  readonly translateY?: number;
  readonly rotate?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly anchorX?: 0 | 50 | 100;
  readonly anchorY?: 0 | 50 | 100;
};

export type TextAnimationData = {
  readonly start: number; // percentage
  readonly end: number; // percentage
  readonly translateX: number;
  readonly translateY: number;
  readonly rotate: number;
  readonly scale: number;
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
  readonly textAnimation?: TextAnimationData;
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
