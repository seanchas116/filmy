import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { Icon } from "@iconify/react";
import { action } from "mobx";
import { usePointerStroke } from "@/editor/components/use-pointer-stroke";

export const TimelineTools: React.FC = observer(() => {
  const editorState = useEditorState();

  const scale = 0.1;
  const currentTime = editorState.currentTime;

  const seekPointerProps = usePointerStroke<HTMLDivElement, void>({
    onBegin: action((e) => {
      const offsetX = e.nativeEvent.offsetX;
      const time = Math.max(0, (offsetX - 16) / scale);
      editorState.currentTime = time;
      editorState.isSeeking = true;
    }),
    onMove: action((e) => {
      const offsetX = e.nativeEvent.offsetX;
      const time = Math.max(0, (offsetX - 16) / scale);
      editorState.currentTime = time;
    }),
    onEnd: action(() => {
      editorState.isSeeking = false;
    }),
  });

  return (
    <div className="h-12 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
      <div className="w-64 border-r border-gray-200 p-2 flex">
        <button
          className="h-8 w-8 flex items-center justify-center text-xl bg-gray-800 rounded-lg text-white"
          onMouseDown={() => {
            editorState.isPlaying ? editorState.pause() : editorState.play();
          }}
        >
          {editorState.isPlaying ? (
            <Icon icon="material-symbols:stop-outline-rounded" />
          ) : (
            <Icon icon="material-symbols:play-arrow-outline-rounded" />
          )}
        </button>
      </div>
      <div className="relative" {...seekPointerProps}>
        <div
          className="absolute top-3 bottom-0 bg-red-500 pointer-events-none"
          style={{
            left: currentTime * scale + 16,
            width: 2,
          }}
        >
          <div className="absolute top-0 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
            {(currentTime / 1000).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
});
