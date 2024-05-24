import { AnimationData, NodeData, TrackItemData } from "./schema";

export type NodeClipboardData = NodeData & {
  children: NodeClipboardData[];
  animations: AnimationData[];
};

export type TrackItemClipboardData = TrackItemData & {
  node: NodeClipboardData;
};
