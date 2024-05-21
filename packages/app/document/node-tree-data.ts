import { AnimationData, NodeData } from "./schema";

export type NodeTreeData = Omit<NodeData, "parent" | "order"> & {
  children: NodeTreeData[];
  animations: AnimationData[];
};
