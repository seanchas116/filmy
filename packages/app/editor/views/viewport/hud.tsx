import { useEditorState } from "../use-editor-state";
import { observer } from "mobx-react-lite";
import { NodeResizeBox } from "./node-resize-box";

export const HUD: React.FC = observer(() => {
  const editorState = useEditorState();

  return (
    <svg
      width={editorState.scroll.domClientRect.width}
      height={editorState.scroll.domClientRect.height}
      className="absolute inset-0 pointer-events-none"
    >
      <NodeResizeBox />
    </svg>
  );
});
