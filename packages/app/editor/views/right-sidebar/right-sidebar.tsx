import { useEditorState } from "../use-editor-state";
import { MIXED, sameOrMixed } from "@/utils/Mixed";
import { observer } from "mobx-react-lite";

export const RightSideBar: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedNodes = editorState.document.selectedNodes;

  const x = sameOrMixed(selectedNodes.map((node) => node.data.x));
  const y = sameOrMixed(selectedNodes.map((node) => node.data.y));
  const width = sameOrMixed(selectedNodes.map((node) => node.data.w));
  const height = sameOrMixed(selectedNodes.map((node) => node.data.h));

  return (
    <div className="w-[256px] bg-white border-l border-gray-200">
      <div>
        <div>{x === MIXED ? "Mixed" : x}</div>
        <div>{y === MIXED ? "Mixed" : y}</div>
      </div>
      <div>
        <div>{width === MIXED ? "Mixed" : width}</div>
        <div>{height === MIXED ? "Mixed" : height}</div>
      </div>
    </div>
  );
});
