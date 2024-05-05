import { observer } from "mobx-react-lite";
import { NodePropertyEditor } from "./node-property-editor";
import { AnimationPropertyEditor } from "./animation-property-editor";

export const RightSideBar: React.FC = observer(() => {
  return (
    <div className="w-[256px] bg-white border-l border-gray-200 text-xs">
      <NodePropertyEditor />
      <AnimationPropertyEditor />
    </div>
  );
});
