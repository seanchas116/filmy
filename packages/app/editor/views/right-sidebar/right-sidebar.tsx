import { observer } from "mobx-react-lite";
import { NodePropertyEditor } from "./node-property-editor";
import { AnimationPropertyEditor } from "./animation-property-editor";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";

export const RightSideBar: React.FC = observer(() => {
  const editorState = useEditorState();
  return (
    <div className="w-[256px] bg-white border-l border-gray-200 text-xs">
      <div className="p-2 flex">
        <button
          className="p-1 aria-pressed:text-blue-500"
          aria-pressed={editorState.mode == "design"}
          onClick={action(() => {
            editorState.mode = "design";
          })}
        >
          Design
        </button>
        <button
          className="p-1 aria-pressed:text-blue-500"
          aria-pressed={editorState.mode == "animate"}
          onClick={action(() => {
            editorState.mode = "animate";
          })}
        >
          Animate
        </button>
      </div>
      <NodePropertyEditor />
      <AnimationPropertyEditor />
    </div>
  );
});
