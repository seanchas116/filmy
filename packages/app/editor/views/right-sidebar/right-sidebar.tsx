import { ExplicitInput } from "@/editor/components/explicit-input";
import { useEditorState } from "../use-editor-state";
import { MIXED, sameOrMixed } from "@/utils/mixed";
import { observer } from "mobx-react-lite";
import tw from "tailwind-styled-components";
import { action } from "mobx";
import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";
import { Icon } from "@iconify/react";

const InputWrap: React.FC<{
  label: ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => {
  return (
    <div className={twMerge("relative h-8", className)}>
      {children}
      <div className="pointer-events-none absolute inset-y-0 left-2 text-[10px] text-gray-400 flex items-center">
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
  const selectedNodes = editorState.document.selection.nodes;

  const x = sameOrMixed(selectedNodes.map((node) => node.data.x));
  const y = sameOrMixed(selectedNodes.map((node) => node.data.y));
  const width = sameOrMixed(selectedNodes.map((node) => node.data.w));
  const height = sameOrMixed(selectedNodes.map((node) => node.data.h));
  const fill = sameOrMixed(selectedNodes.map((node) => node.data.fill));
  const strokeFill = sameOrMixed(
    selectedNodes.map((node) => node.data.stroke?.fill)
  );
  const strokeWidth = sameOrMixed(
    selectedNodes.map((node) => node.data.stroke?.width)
  );

  return (
    <div className="w-[256px] bg-white border-l border-gray-200 text-xs">
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
      <div className="p-2 flex flex-col gap-2">
        <h3>Fill</h3>
        <input
          type="color"
          className="rounded-lg px-1 h-8"
          value={fill === MIXED ? "#000000" : fill?.hex ?? "#000000"}
          onChange={action((e) => {
            const value = e.target.value;
            for (const node of selectedNodes) {
              node.data = {
                ...node.data,
                fill: {
                  type: "solid",
                  hex: value,
                },
              };
            }
          })}
        />
      </div>
      <div className="p-2 flex flex-col gap-2">
        <h3>Stroke</h3>
        <div className="flex gap-2">
          <input
            type="color"
            className="rounded-lg px-1 h-8"
            value={
              strokeFill === MIXED ? "#000000" : strokeFill?.hex ?? "#000000"
            }
            onChange={action((e) => {
              const value = e.target.value;
              for (const node of selectedNodes) {
                node.data = {
                  ...node.data,
                  stroke: {
                    width: node.data.stroke?.width ?? 1,
                    fill: {
                      type: "solid",
                      hex: value,
                    },
                  },
                };
              }
            })}
          />
          <InputWrap
            label={<Icon icon="material-symbols:line-weight-rounded" />}
            className="w-1/3"
          >
            <InputBody
              value={strokeWidth === MIXED ? "" : String(strokeWidth ?? "")}
              onChange={action((value) => {
                const n = Number(value);
                if (isNaN(n)) {
                  return;
                }
                for (const node of selectedNodes) {
                  node.data = {
                    ...node.data,
                    stroke: {
                      width: n,
                      fill: node.data.stroke?.fill ?? {
                        type: "solid",
                        hex: "#000000",
                      },
                    },
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
