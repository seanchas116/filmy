import { useEditorState } from "../use-editor-state";
import { MIXED, sameOrMixed } from "@/utils/mixed";
import { observer } from "mobx-react-lite";
import { action } from "mobx";
import { Icon } from "@iconify/react";
import { flattenGroup } from "@/document/node";
import { InputBody, InputWrap, NumberInput } from "./input";
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
  const opacity = sameOrMixed(nodeDatas.map((data) => data.opacity ?? 100));
  const fill = sameOrMixed(nodeDatas.map((data) => data.fill));
  const strokeFill = sameOrMixed(nodeDatas.map((data) => data.stroke?.fill));
  const strokeWidth = sameOrMixed(nodeDatas.map((data) => data.stroke?.width));
  const translateX = sameOrMixed(nodeDatas.map((data) => data.translateX ?? 0));
  const translateY = sameOrMixed(nodeDatas.map((data) => data.translateY ?? 0));
  const scaleX = sameOrMixed(nodeDatas.map((data) => data.scaleX ?? 100));
  const scaleY = sameOrMixed(nodeDatas.map((data) => data.scaleY ?? 100));
  const rotate = sameOrMixed(nodeDatas.map((data) => data.rotate ?? 0));
  const anchor = sameOrMixed(
    nodeDatas.map(
      (data) => `${data.anchorX ?? 50}:${data.anchorY ?? 50}` as const
    )
  );

  const text = sameOrMixed(textNodeDatas.map((data) => data.text));
  const fontFamily = sameOrMixed(textNodeDatas.map((data) => data.fontFamily));
  const fontSize = sameOrMixed(textNodeDatas.map((data) => data.fontSize));
  const fontWeight = sameOrMixed(textNodeDatas.map((data) => data.fontWeight));

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
          <InputWrap label={<Icon icon="material-symbols:font-download" />}>
            <InputBody
              value={fontFamily === MIXED ? "" : fontFamily ?? ""}
              placeholder={fontFamily === MIXED ? "Mixed" : undefined}
              onChangeValue={(value) => {
                for (const node of selectedNodes) {
                  if (node.data.type === "text") {
                    node.data = {
                      ...node.data,
                      fontFamily: value,
                    };
                  }
                }
              }}
            />
          </InputWrap>
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
                        fontSize: value,
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
                        fontWeight: value,
                      };
                    }
                  }
                })}
              />
            </div>
          </div>
        </div>
      )}
      <div className="p-2 flex flex-col gap-2">
        <h3>Transform</h3>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="X"
            value={translateX}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = {
                  ...node.data,
                  translateX: value,
                };
              }
            })}
          />
          <NumberInput
            label="Y"
            value={translateY}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = {
                  ...node.data,
                  translateY: value,
                };
              }
            })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={<Icon icon="material-symbols:width-rounded" />}
            value={scaleX}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = {
                  ...node.data,
                  scaleX: value,
                };
              }
            })}
          />
          <NumberInput
            label={<Icon icon="material-symbols:width-rounded" rotate={1} />}
            value={scaleY}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = {
                  ...node.data,
                  scaleY: value,
                };
              }
            })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={<Icon icon="material-symbols:rotate-left-rounded" />}
            value={rotate}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = {
                  ...node.data,
                  rotate: value,
                };
              }
            })}
          />
        </div>
        {/* TODO: anchor */}
        <div className="grid grid-cols-3 w-fit">
          {([0, 50, 100] as const).map((anchorY) => {
            return ([0, 50, 100] as const).map((anchorX) => {
              return (
                <button
                  key={`${anchorX}:${anchorY}`}
                  className="p-0.5 group"
                  aria-pressed={anchor === `${anchorX}:${anchorY}`}
                  onClick={action(() => {
                    for (const node of selectedNodes) {
                      node.data = {
                        ...node.data,
                        anchorX,
                        anchorY,
                      };
                    }
                  })}
                >
                  <div className="w-3 h-3 rounded bg-gray-200 group-hover:bg-gray-300 group-aria-pressed:bg-blue-500" />
                </button>
              );
            });
          })}
        </div>
      </div>
    </>
  );
});
