export type NodeCommonData = {
  readonly parent?: string;
  readonly order: number;

  readonly name?: string;
  readonly hidden?: boolean;
  readonly locked?: boolean;

  readonly fill?: FillData;
  readonly stroke?: StrokeData;

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

export type NodeData = NodeCommonData &
  (
    | {
        readonly type: "text";
        readonly text: string;
        readonly font: FontData;
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
        readonly type: "video";
        readonly src: string;
        readonly offset: number;
      }
  );

export type TimelineData = {
  readonly sequence: string;
  readonly order: number;
  readonly name: string;
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
