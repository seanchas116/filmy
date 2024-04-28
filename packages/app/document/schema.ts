export type NodeCommonData = {
  readonly parent?: string;
  readonly order: number;

  readonly fill?: FillData;
  readonly stroke?: StrokeData;

  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

export type FillData = {
  readonly type: "solid";
  readonly hex: string; // #RRGGBB
};

export type StrokeData = {
  readonly width: number;
  readonly fill: FillData;
};

export type NodeData = NodeCommonData &
  (
    | {
        readonly type: "text";
        readonly text: string;
      }
    | {
        readonly type: "rectangle";
      }
    | {
        readonly type: "ellipse";
      }
    | {
        readonly type: "frame";
      }
    | {
        readonly type: "page";
      }
  );

export type TimelineData = {
  readonly sequence: string;
  readonly order: number;
};

export type TimelineItemData = {
  readonly timeline: string;
  readonly start: number;
  readonly duration: number;
  readonly node: string;
};

export type SequenceData = {
  readonly name: string;
  readonly order: number;
};
