import { NodeTreeView } from "./node-tree-view";

export const LeftSideBar: React.FC = () => {
  return (
    <div className="w-[256px] bg-white border-r border-gray-200">
      <NodeTreeView />
    </div>
  );
};
