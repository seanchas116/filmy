import { useEditorState } from "../use-editor-state";

export const TimelineEditor: React.FC = () => {
  const editorState = useEditorState();
  const timelines = [
    ...editorState.document.timelines.instances.values(),
  ].toSorted((a, b) => a.data.order - b.data.order); // TODO: cache sorting

  const scale = 0.1;
  const currentTime = 0; // TODO

  return (
    <div className="h-64 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
      <div className="w-64 border-r border-gray-200">
        {timelines.map((timeline) => (
          <div key={timeline.id} className="p-2">
            {timeline.data.name}
          </div>
        ))}
      </div>
      <div className="p-4 pt-8">
        <div className="relative">
          {timelines.map((timeline) => {
            return (
              <div className="flex relative h-10" key={timeline.id}>
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
            );
          })}
          {/* time cursor */}
          <div
            className="absolute -top-2 bottom-0 bg-red-500"
            style={{
              left: currentTime * scale,
              width: 2,
            }}
          >
            <div className="absolute -top-6 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
              {(currentTime / 1000).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
