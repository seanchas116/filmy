import { useEditorState } from "../use-editor-state";

export const TimelineEditor: React.FC = () => {
  const editorState = useEditorState();
  const timelines = [
    ...editorState.document.timelines.instances.values(),
  ].toSorted((a, b) => a.data.order - b.data.order); // TODO: cache sorting

  const scale = 0.1;

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
            <div className="p-1" key={timeline.id}>
              <div className="flex relative h-10">
                {timeline.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-100 absolute h-full top-0 rounded-lg border border-gray-200"
                    style={{
                      left: item.data.start * scale,
                      width: item.data.duration * scale,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
