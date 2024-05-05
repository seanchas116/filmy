import { observer } from "mobx-react-lite";
import { NodePropertyEditor } from "./node-property-editor";
import { AnimationPropertyEditor } from "./animation-property-editor";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import * as Tabs from "@radix-ui/react-tabs";

export const RightSideBar: React.FC = observer(() => {
  const editorState = useEditorState();
  return (
    <Tabs.Root
      value={editorState.mode}
      onValueChange={action((value) => {
        editorState.mode = value as "design" | "animate";
      })}
      className="w-[256px] bg-white border-l border-gray-200 text-xs"
    >
      <Tabs.List className="p-2 flex">
        <Tabs.Trigger
          value="design"
          className="p-1 aria-selected:text-blue-500"
        >
          Design
        </Tabs.Trigger>
        <Tabs.Trigger
          value="animate"
          className="p-1 aria-selected:text-blue-500"
        >
          Animate
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="design">
        <NodePropertyEditor />
      </Tabs.Content>
      <Tabs.Content value="animate">
        <AnimationPropertyEditor />
      </Tabs.Content>
    </Tabs.Root>
  );
});
