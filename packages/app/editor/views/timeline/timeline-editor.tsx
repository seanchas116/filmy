import { useEditorState } from "../use-editor-state";

export const TimelineEditor: React.FC = () => {
  const editorState = useEditorState();
  const timelines = [
    ...editorState.document.timelines.instances.values(),
  ].toSorted((a, b) => a.data.order - b.data.order); // TODO: cache sorting

  return (
    <div className="h-64 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
      <div className="w-64 border-r border-gray-200">
        {timelines.map((timeline) => (
          <div key={timeline.id} className="p-2">
            {timeline.data.name}
          </div>
        ))}
      </div>
      <div>
        {timelines.map((timeline) => {
          return (
            <div key={timeline.id} className="flex">
              {timeline.items.map((item) => (
                <div key={item.id}>{item.id}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
