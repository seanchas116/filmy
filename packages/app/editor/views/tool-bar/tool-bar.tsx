import { Icon } from "@iconify/react";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import tw from "tailwind-styled-components";

const IconButton = tw.button`
  p-2 hover:bg-gray-100 rounded-lg aria-pressed:bg-blue-100 aria-pressed:text-blue-500
`;

export const ToolBar: React.FC = observer(() => {
  const editorState = useEditorState();

  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center px-2">
      <IconButton
        aria-pressed={editorState.tool === "rectangle"}
        onClick={action(() => {
          editorState.tool = "rectangle";
        })}
      >
        <Icon icon="material-symbols:square-outline-rounded" />
      </IconButton>
      <IconButton
        aria-pressed={editorState.tool === "ellipse"}
        onClick={action(() => {
          editorState.tool = "ellipse";
        })}
      >
        <Icon icon="material-symbols:circle-outline" />
      </IconButton>
      <IconButton
        aria-pressed={editorState.tool === "text"}
        onClick={action(() => {
          editorState.tool = "text";
        })}
      >
        <Icon icon="material-symbols:title-rounded" />
      </IconButton>
    </div>
  );
});
