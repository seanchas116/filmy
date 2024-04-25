import { Icon } from "@iconify/react";
import { useEditorState } from "./use-editor-state";
import { action } from "mobx";
import { observer } from "mobx-react-lite";

export const ToolBar: React.FC = observer(() => {
  const editorState = useEditorState();

  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center px-2">
      <button
        className="p-2 hover:bg-gray-100 rounded-lg aria-pressed:bg-blue-100 aria-pressed:text-blue-500"
        aria-pressed={editorState.tool === "rectangle"}
        onClick={action(() => {
          editorState.tool = "rectangle";
        })}
      >
        <Icon icon="material-symbols:check-box-outline-blank" />
      </button>
      <button
        className="p-2 hover:bg-gray-100 rounded-lg aria-pressed:bg-blue-100 aria-pressed:text-blue-500"
        aria-pressed={editorState.tool === "ellipse"}
        onClick={action(() => {
          editorState.tool = "ellipse";
        })}
      >
        <Icon icon="material-symbols:title-rounded" />
      </button>
    </div>
  );
});
