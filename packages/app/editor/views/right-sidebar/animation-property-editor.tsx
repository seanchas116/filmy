import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { NumberInput } from "./input";
import { action } from "mobx";

export const AnimationPropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedAnimations = editorState.document.selection.animations;

  if (!selectedAnimations.length) {
    return null;
  }

  const animation = selectedAnimations[0];
  const data = animation.data;

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 items-center">
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
      </div>
      <div className="grid grid-cols-3 gap-2 items-center">
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
      </div>
      {data.type === "property" && (
        <>
          <div className="grid grid-cols-3 gap-2 items-center">
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
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
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
          </div>
        </>
      )}
    </div>
  );
});
