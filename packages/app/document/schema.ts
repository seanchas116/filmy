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
  readonly easing: readonly [number, number, number, number];
  readonly from?: number;
  readonly to: number;
};
export type TextAnimationData = AnimationCommonData & {
  readonly type: "text";
  readonly mode: "in" | "out";
  readonly easing: readonly [number, number, number, number];
  readonly charEasing: readonly [number, number, number, number];
  readonly translateX: number;
  readonly translateY: number;
  readonly rotate: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly anchorX: 0 | 50 | 100;
  readonly anchorY: 0 | 50 | 100;
};

export type AnimationData = PropertyAnimationData | TextAnimationData;

export type NodeCommonData = {
  readonly parent?: string;
  readonly order: number;

  readonly name?: string;
  readonly hidden?: boolean;
  readonly locked?: boolean;

  readonly fill?: FillData;
  readonly stroke?: StrokeData;
  readonly opacity?: number; // percentage

  readonly translateX?: number;
  readonly translateY?: number;
  readonly rotate?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly anchorX?: 0 | 50 | 100;
  readonly anchorY?: 0 | 50 | 100;

  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export type FontData = {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight?: number;
  readonly fontStyle?: string;
  readonly lineHeight?: number; // percentage
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
} & FontData;

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
