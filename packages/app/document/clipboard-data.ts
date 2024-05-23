import { AnimationData, NodeData } from "./schema";

export type NodeClipboardData = NodeData & {
  children: NodeClipboardData[];
  animations: AnimationData[];
};

export type TrackItemClipboardData = NodeData & {
  node: NodeClipboardData;
};
