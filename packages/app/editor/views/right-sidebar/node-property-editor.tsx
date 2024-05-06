import { useEditorState } from "../use-editor-state";
import { MIXED, sameOrMixed } from "@/utils/mixed";
import { observer } from "mobx-react-lite";
import { action } from "mobx";
import { Icon } from "@iconify/react";
import { flattenGroup } from "@/document/node";
import { NumberInput } from "./input";
import { TextNodeData } from "@/document/schema";

const KeyframeButton = () => {
  return (
    <button className="text-base text-gray-400">
      <Icon icon="material-symbols:stat-0-outline" />
    </button>
  );
};

export const NodePropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedNodes = flattenGroup(editorState.document.selection.nodes);

  if (!selectedNodes.length) {
    return null;
  }

  const nodeDatas = selectedNodes.map((node) => node.data);
  const textNodeDatas = nodeDatas.filter(
    (data): data is TextNodeData => data.type === "text"
  );

  const x = sameOrMixed(nodeDatas.map((data) => data.x));
  const y = sameOrMixed(nodeDatas.map((data) => data.y));
  const width = sameOrMixed(nodeDatas.map((data) => data.w));
  const height = sameOrMixed(nodeDatas.map((data) => data.h));
  const opacity = sameOrMixed(nodeDatas.map((data) => data.opacity));
  const fill = sameOrMixed(nodeDatas.map((data) => data.fill));
  const strokeFill = sameOrMixed(nodeDatas.map((data) => data.stroke?.fill));
  const strokeWidth = sameOrMixed(nodeDatas.map((data) => data.stroke?.width));

  const text = sameOrMixed(textNodeDatas.map((data) => data.text));
  const fontSize = sameOrMixed(textNodeDatas.map((data) => data.font.size));
  const fontWeight = sameOrMixed(textNodeDatas.map((data) => data.font.weight));

  return (
    <>
      <div className="p-2 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-[auto_1fr]">
            <KeyframeButton />
            <NumberInput
              label="X"
              value={x}
              onChangeValue={action((value) => {
                for (const node of selectedNodes) {
                  node.data = { ...node.data, x: value };
                }
              })}
            />
          </div>
          <div className="grid grid-cols-[auto_1fr]">
            <KeyframeButton />
            <NumberInput
              label="Y"
              value={y}
              onChangeValue={action((value) => {
                for (const node of selectedNodes) {
                  node.data = { ...node.data, y: value };
                }
              })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-[auto_1fr]">
            <KeyframeButton />
            <NumberInput
              label="W"
              value={width}
              onChangeValue={action((value) => {
                for (const node of selectedNodes) {
                  node.data = { ...node.data, w: value };
                }
              })}
            />
          </div>
          <div className="grid grid-cols-[auto_1fr]">
            <KeyframeButton />
            <NumberInput
              label="H"
              value={height}
              onChangeValue={action((value) => {
                for (const node of selectedNodes) {
                  node.data = { ...node.data, h: value };
                }
              })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid grid-cols-[auto_1fr]">
            <KeyframeButton />
            <NumberInput
              label={<Icon icon="material-symbols:opacity" />}
              value={opacity}
              onChangeValue={action((value) => {
                for (const node of selectedNodes) {
                  node.data = { ...node.data, opacity: value };
                }
              })}
            />
          </div>
        </div>
      </div>
      <div className="p-2 flex flex-col gap-2">
        <h3>Fill</h3>
        <div className="flex">
          <KeyframeButton />
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
      </div>
      <div className="p-2 flex flex-col gap-2">
        <h3>Stroke</h3>
        <div className="flex gap-2">
          <div className="flex">
            <KeyframeButton />
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
          </div>
          <div className="grid grid-cols-[auto_1fr] w-1/2">
            <KeyframeButton />
            <NumberInput
              label={<Icon icon="material-symbols:line-weight-rounded" />}
              value={strokeWidth}
              onChangeValue={action((value) => {
                for (const node of selectedNodes) {
                  node.data = {
                    ...node.data,
                    stroke: {
                      width: value,
                      fill: node.data.stroke?.fill ?? {
                        type: "solid",
                        hex: "#000000",
                      },
                    },
                  };
                }
              })}
            />
          </div>
        </div>
      </div>
      {textNodeDatas.length > 0 && (
        <div className="p-2 flex flex-col gap-2">
          <h3>Text</h3>
          <textarea
            className="w-full rounded-lg p-2 bg-gray-100"
            value={text === MIXED ? "" : text ?? ""}
            onChange={action((e) => {
              const value = e.target.value;
              for (const node of selectedNodes) {
                if (node.data.type === "text") {
                  node.data = { ...node.data, text: value };
                }
              }
            })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="grid grid-cols-[auto_1fr]">
              <KeyframeButton />
              <NumberInput
                label={<Icon icon="material-symbols:format-size" />}
                value={fontSize}
                onChangeValue={action((value) => {
                  for (const node of selectedNodes) {
                    if (node.data.type === "text") {
                      node.data = {
                        ...node.data,
                        font: {
                          ...node.data.font,
                          size: value,
                        },
                      };
                    }
                  }
                })}
              />
            </div>
            <div className="grid grid-cols-[auto_1fr]">
              <KeyframeButton />
              <NumberInput
                label={<Icon icon="material-symbols:line-weight-rounded" />}
                value={fontWeight}
                onChangeValue={action((value) => {
                  for (const node of selectedNodes) {
                    if (node.data.type === "text") {
                      node.data = {
                        ...node.data,
                        font: {
                          ...node.data.font,
                          weight: value,
                        },
                      };
                    }
                  }
                })}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});
