import { ExplicitInput } from "@/editor/components/explicit-input";
import { useEditorState } from "../use-editor-state";
import { MIXED, sameOrMixed } from "@/utils/Mixed";
import { observer } from "mobx-react-lite";
import tw from "tailwind-styled-components";
import { action } from "mobx";

const InputWrap: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div className="relative h-8">
      {children}
      <div className="pointer-events-none absolute inset-y-0 leading-8 left-2 text-[10px] text-gray-400">
        {label}
      </div>
    </div>
  );
};

const InputBody = tw(
  ExplicitInput
)`bg-gray-100 absolute w-full pl-6 pr-2 h-8 rounded-lg text-xs outline-blue-500`;

export const RightSideBar: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedNodes = editorState.document.selectedNodes;

  const x = sameOrMixed(selectedNodes.map((node) => node.data.x));
  const y = sameOrMixed(selectedNodes.map((node) => node.data.y));
  const width = sameOrMixed(selectedNodes.map((node) => node.data.w));
  const height = sameOrMixed(selectedNodes.map((node) => node.data.h));

  return (
    <div className="w-[256px] bg-white border-l border-gray-200">
      <div className="p-2 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <InputWrap label="X">
            <InputBody
              value={x === MIXED ? "" : String(x ?? "")}
              onChangeValue={action((value) => {
                const n = Number(value);
                if (isNaN(n)) {
                  return;
                }
                for (const node of selectedNodes) {
                  node.data = {
                    ...node.data,
                    x: n,
                  };
                }
              })}
            />
          </InputWrap>
          <InputWrap label="Y">
            <InputBody
              value={y === MIXED ? "" : String(y ?? "")}
              onChangeValue={action((value) => {
                const n = Number(value);
                if (isNaN(n)) {
                  return;
                }
                for (const node of selectedNodes) {
                  node.data = {
                    ...node.data,
                    y: n,
                  };
                }
              })}
            />
          </InputWrap>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputWrap label="W">
            <InputBody
              value={width === MIXED ? "" : String(width ?? "")}
              onChangeValue={action((value) => {
                const n = Number(value);
                if (isNaN(n)) {
                  return;
                }
                for (const node of selectedNodes) {
                  node.data = {
                    ...node.data,
                    w: n,
                  };
                }
              })}
            />
          </InputWrap>
          <InputWrap label="H">
            <InputBody
              value={height === MIXED ? "" : String(height ?? "")}
              onChangeValue={action((value) => {
                const n = Number(value);
                if (isNaN(n)) {
                  return;
                }
                for (const node of selectedNodes) {
                  node.data = {
                    ...node.data,
                    h: n,
                  };
                }
              })}
            />
          </InputWrap>
        </div>
      </div>
    </div>
  );
});
