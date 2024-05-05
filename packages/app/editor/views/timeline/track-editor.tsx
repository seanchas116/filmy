import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { TrackArea } from "./track-area";

export const TrackEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const tracks = editorState.document.currentSequence.tracks;

  const scale = 0.1;
  const currentTime = editorState.currentTime;

  return (
    <div className="h-48 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
      <div className="w-64 border-r border-gray-200 p-2">
        {tracks.map((track) => (
          <div key={track.id} className="p-1 h-10 flex items-center">
            {track.data.name}
          </div>
        ))}
      </div>
      <div
        className="p-4"
        onMouseDown={action(() => {
          editorState.document.selection.clear();
          editorState.document.selection.clearCurrentScene();
        })}
      >
        <div className="relative h-full">
          <TrackArea />
          {/* time cursor */}
          <div
            className="absolute -top-4 -bottom-5 bg-red-500 pointer-events-none"
            style={{
              left: currentTime * scale,
              width: 2,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
});
