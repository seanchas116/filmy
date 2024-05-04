import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { Icon } from "@iconify/react";
import { action } from "mobx";
import { usePointerStroke } from "@/editor/components/use-pointer-stroke";
import { TimelineArea } from "./timeline-area";
import { AnimationData } from "@/document/schema";
import { Node } from "@/document/node";

export const TimelineEditor: React.FC = observer(() => {
  const editorState = useEditorState();
  const tracks = editorState.document.currentSequence.tracks;

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
    <div className="h-64 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
      <div className="w-64 border-r border-gray-200 p-2">
        <div className="flex mb-2">
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
        {tracks.map((track) => (
          <div key={track.id} className="p-1 h-10 flex items-center">
            {track.data.name}
          </div>
        ))}
      </div>
      <div className="grid grid-rows-[2fr_1fr]">
        <div
          className="p-4"
          onMouseDown={action(() => {
            editorState.document.selection.clear();
            editorState.document.selection.clearCurrentScene();
          })}
        >
          <div className="relative h-full">
            {/* seek area */}
            <div className="h-8 relative">
              <div className="absolute -inset-4" {...seekPointerProps} />
            </div>
            <TimelineArea />
            {/* time cursor */}
            <div
              className="absolute top-4 bottom-0 bg-red-500 pointer-events-none"
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
        <div className="p-4 border-t border-gray-200">
          <AnimationEditor />
        </div>
      </div>
    </div>
  );
});

const AnimationEditor = observer(() => {
  const editorState = useEditorState();
  const currentScene = editorState.document.selection.currentScene;
  if (!currentScene) {
    return;
  }

  const animations: AnimationData[] = [];

  const visitNode = (node: Node) => {
    for (const animation of node.animations) {
      animations.push(animation);
    }
    for (const child of node.children) {
      visitNode(child);
    }
  };
  visitNode(currentScene.node);
  console.log(animations);

  const scale = 0.1;

  return (
    <div className="relative">
      {animations.map((animation, i) => {
        return (
          <div
            key={i}
            className="absolute bg-gray-100 rounded-lg flex items-center justify-center border-gray-200 border-2"
            style={{
              left: (currentScene.start + animation.start) * scale,
              width: (currentScene.start + animation.duration) * scale,
              height: 20,
              top: i * 20,
            }}
          >
            {animation.type === "property"
              ? animation.property
              : animation.type}
          </div>
        );
      })}
    </div>
  );
});
