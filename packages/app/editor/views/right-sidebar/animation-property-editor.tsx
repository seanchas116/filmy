import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { NumberInput } from "./input";
import { action } from "mobx";
import tw from "tailwind-styled-components";
import { nanoid } from "nanoid";

const AnimationAddView: React.FC = observer(() => {
  const editorState = useEditorState();

  return (
    <div className="p-2">
      <h2>Add Animation</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="bg-gray-200 p-2"
          onClick={action(() => {
            const nodes = editorState.document.selection.nodes;

            for (const node of nodes) {
              if (node.type !== "text") {
                continue;
              }

              editorState.document.animations.add(nanoid(), {
                order: 0, // TODO
                node: node.id,
                type: "in",
                start: 0,
                duration: 1000,
              });
            }
          })}
        >
          Text Animation
        </button>
        <button
          className="bg-gray-200 p-2"
          onClick={action(() => {
            const nodes = editorState.document.selection.nodes;

            for (const node of nodes) {
              if (node.type !== "text") {
                continue;
              }

              editorState.document.animations.add(nanoid(), {
                order: 0, // TODO
                node: node.id,
                type: "property",
                property: "opacity",
                start: 0,
                duration: 500,
                easing: "linear",
                from: 0,
                to: 100,
              });
            }
          })}
        >
          Property Animation
        </button>
      </div>
    </div>
  );
});

const Row = tw.div`grid grid-cols-3 gap-2 items-center`;

export const AnimationPropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedAnimations = editorState.document.selection.animations;

  if (!selectedAnimations.length) {
    return <AnimationAddView />;
  }

  const animation = selectedAnimations[0];
  const data = animation.data;

  return (
    <div className="p-2 flex flex-col gap-2">
      <Row>
        <div>Start</div>
        <NumberInput
          className="col-span-2"
          label=""
          value={animation.data.start}
          onChangeValue={action((value) => {
            animation.data = {
              ...animation.data,
              start: value,
            };
          })}
        />
      </Row>
      <Row>
        <div>Duration</div>
        <NumberInput
          className="col-span-2"
          label=""
          value={animation.data.duration}
          onChangeValue={action((value) => {
            animation.data = {
              ...animation.data,
              duration: value,
            };
          })}
        />
      </Row>
      {data.type === "property" && (
        <>
          <Row>
            <div>Property</div>
            <select
              value={data.property}
              className="h-8 bg-gray-100 rounded-lg px-4 w-fit"
              onChange={(e) => {
                animation.data = {
                  ...data,
                  property: e.target.value,
                };
              }}
            >
              <option value="opacity">Opacity</option>
              <option value="x">X</option>
              <option value="y">Y</option>
              <option value="w">Width</option>
              <option value="h">Height</option>
            </select>
          </Row>
          <Row>
            <div>Initial Value</div>
            <NumberInput
              className="col-span-2"
              label=""
              value={data.from}
              onChangeValue={action((value) => {
                animation.data = {
                  ...data,
                  from: value,
                };
              })}
            />
          </Row>
          <Row>
            <div>Final Value</div>
            <NumberInput
              className="col-span-2"
              label=""
              value={data.to}
              onChangeValue={action((value) => {
                animation.data = {
                  ...data,
                  to: value,
                };
              })}
            />
          </Row>
        </>
      )}
    </div>
  );
});
