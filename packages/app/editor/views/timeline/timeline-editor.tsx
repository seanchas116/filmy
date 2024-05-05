import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { TimelineArea } from "./timeline-area";
import { Node } from "@/document/node";
import { Animation } from "@/document/animation";

export const TimelineEditor: React.FC = observer(() => {
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
          <TimelineArea />
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

export const AnimationEditor = observer(() => {
  const editorState = useEditorState();
  const currentScene = editorState.document.selection.currentScene;

  const animations: Animation[] = [];

  const visitNode = (node: Node) => {
    for (const animation of node.animations) {
      animations.push(animation);
    }
    for (const child of node.children) {
      visitNode(child);
    }
  };
  if (currentScene) {
    visitNode(currentScene.node);
  }

  const scale = 0.1;

  return (
    <div className="h-32 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
      <div className="w-64 border-r border-gray-200 p-4 px-2">
        {animations.map((anim, i) => {
          return (
            <div key={i} className="p-1 h-8 flex items-center">
              {anim.node.name} -{" "}
              {anim.data.type === "property"
                ? anim.data.property
                : anim.data.type}
            </div>
          );
        })}
      </div>
      <div className="p-4">
        <div className="relative h-full">
          {animations.map((animation, i) => {
            if (animation.data.type !== "property") {
              return;
            }

            return (
              <div
                key={animation.id}
                className="absolute flex items-center justify-center text-xs"
                style={{
                  left:
                    ((currentScene?.start ?? 0) + animation.data.start) * scale,
                  width: animation.data.duration * scale,
                  height: 32,
                  top: i * 32,
                }}
              >
                <div className="absolute inset-x-0 top-1 bottom-1 bg-gray-100 border-gray-200 border-2" />
                <div className="absolute left-0 top-0 bottom-0 my-auto w-fit h-6 px-2 leading-6 rounded-full bg-gray-200 -translate-x-1/2">
                  {animation.data.from}
                </div>
                <div className="absolute right-0 top-0 bottom-0 my-auto w-fit h-6 px-2 leading-6 rounded-full bg-gray-200 translate-x-1/2">
                  {animation.data.to}
                </div>
              </div>
            );
          })}
          <div
            className="absolute -top-4 -bottom-5 bg-red-500 pointer-events-none"
            style={{
              left: editorState.currentTime * scale,
              width: 2,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
});
