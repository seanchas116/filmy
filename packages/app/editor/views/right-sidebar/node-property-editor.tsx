import { useEditorState } from "../use-editor-state";
import { MIXED, sameOrMixed } from "@/utils/mixed";
import { observer } from "mobx-react-lite";
import { action } from "mobx";
import { Icon } from "@iconify/react";
import { flattenGroup } from "@/document/node";
import { NumberInput } from "./input";

export const NodePropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedNodes = flattenGroup(editorState.document.selection.nodes);

  if (!selectedNodes.length) {
    return null;
  }

  const x = sameOrMixed(selectedNodes.map((node) => node.data.x));
  const y = sameOrMixed(selectedNodes.map((node) => node.data.y));
  const width = sameOrMixed(selectedNodes.map((node) => node.data.w));
  const height = sameOrMixed(selectedNodes.map((node) => node.data.h));
  const opacity = sameOrMixed(selectedNodes.map((node) => node.data.opacity));
  const fill = sameOrMixed(selectedNodes.map((node) => node.data.fill));
  const strokeFill = sameOrMixed(
    selectedNodes.map((node) => node.data.stroke?.fill)
  );
  const strokeWidth = sameOrMixed(
    selectedNodes.map((node) => node.data.stroke?.width)
  );

  return (
    <>
      <div className="p-2 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="X"
            value={x}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = { ...node.data, x: value };
              }
            })}
          />
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
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="W"
            value={width}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = { ...node.data, w: value };
              }
            })}
          />
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
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={<Icon icon="material-symbols:opacity" />}
            value={typeof opacity === "number" ? opacity * 100 : 100}
            onChangeValue={action((value) => {
              for (const node of selectedNodes) {
                node.data = { ...node.data, opacity: value / 100 };
              }
            })}
          />
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
          <NumberInput
            label={<Icon icon="material-symbols:line-weight-rounded" />}
            className="w-1/3"
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
    </>
  );
});
