import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { NumberInput } from "./input";
import { action } from "mobx";
import tw from "tailwind-styled-components";
import { nanoid } from "nanoid";
import { linear, ease, easeIn, easeOut, easeInOut } from "@/utils/easing";
import {
  AnimationCommonData,
  PropertyAnimationData,
  TextAnimationData,
} from "@/document/schema";
import { mixedToUndefined, sameOrMixed } from "@/utils/mixed";

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
                type: "text",
                mode: "in",
                easing: easeOut,
                charEasing: easeOut,
                translateX: 0,
                translateY: 48,
                rotate: -45,
                scaleX: 100,
                scaleY: 100,
                anchorX: 50,
                anchorY: 50,
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
              editorState.document.animations.add(nanoid(), {
                order: 0, // TODO
                node: node.id,
                type: "property",
                property: "opacity",
                start: 0,
                duration: 500,
                easing: linear,
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

const CommonAnimationPropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const animations = editorState.document.selection.animations;
  const datas = animations.map((a) => a.data);

  if (!datas.length) {
    return null;
  }

  const update = (data: Partial<AnimationCommonData>) => {
    for (const anim of animations) {
      anim.data = {
        ...anim.data,
        ...data,
      };
    }
  };

  const start = sameOrMixed(datas.map((d) => d.start));
  const duration = sameOrMixed(datas.map((d) => d.duration));
  const easing = sameOrMixed(datas.map((d) => d.easing));

  return (
    <>
      <Row>
        <div>Start</div>
        <NumberInput
          className="col-span-2"
          label=""
          value={start}
          onChangeValue={action((value) => {
            update({
              start: value,
            });
          })}
        />
      </Row>
      <Row>
        <div>Duration</div>
        <NumberInput
          className="col-span-2"
          label=""
          value={duration}
          onChangeValue={action((value) => {
            update({
              duration: value,
            });
          })}
        />
      </Row>
      <Row>
        <div>Easing</div>
        <EasingSelect
          value={mixedToUndefined(easing) ?? linear}
          onChangeValue={(easing) => {
            update({
              easing,
            });
          }}
        />
      </Row>
    </>
  );
});

export const PropertyAnimationPropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const animations = editorState.document.selection.animations;
  const datas = animations
    .map((a) => a.data)
    .filter((a): a is PropertyAnimationData => a.type === "property");

  if (!datas.length) {
    return null;
  }

  const update = (data: Partial<PropertyAnimationData>) => {
    for (const anim of animations) {
      if (anim.data.type === "property") {
        anim.data = {
          ...anim.data,
          ...data,
        };
      }
    }
  };

  const property = sameOrMixed(datas.map((d) => d.property));
  const from = sameOrMixed(datas.map((d) => d.from));
  const to = sameOrMixed(datas.map((d) => d.to));

  return (
    <>
      <Row>
        <div>Property</div>
        <select
          value={mixedToUndefined(property) ?? ""}
          className="h-8 bg-gray-100 rounded-lg px-4 w-fit"
          onChange={action((e) => {
            update({
              property: e.target.value,
            });
          })}
        >
          <option value="opacity">Opacity</option>
          <option value="translateX">Translate X</option>
          <option value="translateY">Translate Y</option>
          <option value="rotate">Rotate</option>
          <option value="scaleX">Scale X</option>
          <option value="scaleY">Scale Y</option>
        </select>
      </Row>
      <Row>
        <div>Initial Value</div>
        <NumberInput
          className="col-span-2"
          label=""
          value={from}
          onChangeValue={action((value) => {
            update({
              from: value,
            });
          })}
        />
      </Row>
      <Row>
        <div>Final Value</div>
        <NumberInput
          className="col-span-2"
          label=""
          value={to}
          onChangeValue={action((value) => {
            update({
              to: value,
            });
          })}
        />
      </Row>
    </>
  );
});

export const TextAnimationPropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const animations = editorState.document.selection.animations;
  const datas = animations
    .map((a) => a.data)
    .filter((a): a is TextAnimationData => a.type === "text");

  if (!datas.length) {
    return null;
  }

  const update = (data: Partial<TextAnimationData>) => {
    for (const anim of animations) {
      if (anim.data.type === "text") {
        anim.data = {
          ...anim.data,
          ...data,
        };
      }
    }
  };

  const mode = sameOrMixed(datas.map((d) => d.mode));

  return (
    <>
      <Row>
        <div>Mode</div>
        <select
          value={mixedToUndefined(mode)}
          className="h-8 bg-gray-100 rounded-lg px-4 w-fit"
          onChange={(e) => {
            update({
              mode: e.target.value as "in" | "out",
            });
          }}
        >
          <option value="in">In</option>
          <option value="out">Out</option>
        </select>
      </Row>
    </>
  );
});

export const AnimationPropertyEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const selectedAnimations = editorState.document.selection.animations;

  if (!selectedAnimations.length) {
    return <AnimationAddView />;
  }

  return (
    <div className="p-2 flex flex-col gap-2">
      <CommonAnimationPropertyEditor />
      <PropertyAnimationPropertyEditor />
      <TextAnimationPropertyEditor />
    </div>
  );
});

const EasingSelect: React.FC<{
  value: readonly [number, number, number, number];
  onChangeValue: (value: readonly [number, number, number, number]) => void;
}> = ({ value, onChangeValue }) => {
  return (
    <select
      value={value.join()}
      className="h-8 bg-gray-100 rounded-lg px-4 w-fit"
      onChange={(e) => {
        const easing = e.target.value.split(",").map(Number) as [
          number,
          number,
          number,
          number,
        ];
        onChangeValue(easing);
      }}
    >
      {Object.entries({
        Ease: ease,
        Linear: linear,
        "Ease In": easeIn,
        "Ease Out": easeOut,
        "Ease In Out": easeInOut,
      }).map(
        ([label, easing]) =>
          easing && (
            <option key={label} value={easing.join()}>
              {label}
            </option>
          )
      )}
    </select>
  );
};
