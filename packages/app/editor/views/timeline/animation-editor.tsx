import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { action } from "mobx";
import { Node } from "@/document/node";
import { Animation } from "@/document/animation";

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

  animations.sort((a, b) => a.data.order - b.data.order);

  const scale = 0.1;

  return (
    <div className="h-48 bg-white border-t border-gray-200 grid grid-cols-[auto_1fr]">
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
      <div
        className="p-4"
        onMouseDown={action(() => {
          editorState.document.selection.clear();
        })}
      >
        <div className="relative h-full">
          {animations.map((animation, i) => {
            const onBarMouseDown = action((e: React.MouseEvent) => {
              editorState.document.selection.clear();
              animation.select();
              e.stopPropagation();

              const initClientX = e.clientX;
              const initStart = animation.data.start;

              const onMouseMove = action((e: MouseEvent) => {
                const totalDeltaX = e.clientX - initClientX;
                const start = Math.max(0, initStart + totalDeltaX / scale);

                animation.data = {
                  ...animation.data,
                  start,
                };
              });

              const onMouseUp = action(() => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);

                editorState.document.undoManager.commit();
              });

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
            });

            const onStartHandleMouseDown = action((e: React.MouseEvent) => {
              e.stopPropagation();

              const initClientX = e.clientX;
              const initStart = animation.data.start;
              const initDuration = animation.data.duration;

              const onMouseMove = action((e: MouseEvent) => {
                const totalDeltaX = e.clientX - initClientX;

                const start = Math.max(0, initStart + totalDeltaX / scale);
                const duration = Math.max(
                  0,
                  initDuration - totalDeltaX / scale
                );

                animation.data = {
                  ...animation.data,
                  start,
                  duration,
                };
              });

              const onMouseUp = action(() => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);

                editorState.document.undoManager.commit();
              });

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
            });

            const onEndHandleMouseDown = action((e: React.MouseEvent) => {
              e.stopPropagation();

              const initClientX = e.clientX;
              const initDuration = animation.data.duration;

              const onMouseMove = action((e: MouseEvent) => {
                const totalDeltaX = e.clientX - initClientX;

                const duration = Math.max(
                  0,
                  initDuration + totalDeltaX / scale
                );

                animation.data = {
                  ...animation.data,
                  duration,
                };
              });

              const onMouseUp = action(() => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);

                editorState.document.undoManager.commit();
              });

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
            });

            return (
              <div
                key={animation.id}
                className="absolute flex items-center justify-center text-xs group"
                aria-selected={animation.selected}
                style={{
                  left:
                    ((currentScene?.start ?? 0) + animation.data.start) * scale,
                  width: animation.data.duration * scale,
                  height: 32,
                  top: i * 32,
                }}
                onMouseDown={onBarMouseDown}
              >
                <div className="absolute inset-x-0 top-1 bottom-1 bg-gray-100 border-gray-200 border-2 group-aria-selected:border-blue-500 group-aria-selected:bg-blue-200" />
                <div
                  className="absolute left-0 top-0 bottom-0 my-auto w-fit h-6 px-2 leading-6 rounded-full bg-gray-200 group-aria-selected:bg-blue-500 group-aria-selected:text-white -translate-x-1/2"
                  onMouseDown={onStartHandleMouseDown}
                >
                  {animation.data.type === "property" ? animation.data.from : 0}
                </div>
                <div
                  className="absolute right-0 top-0 bottom-0 my-auto w-fit h-6 px-2 leading-6 rounded-full bg-gray-200 group-aria-selected:bg-blue-500 group-aria-selected:text-white translate-x-1/2"
                  onMouseDown={onEndHandleMouseDown}
                >
                  {animation.data.type === "property" ? animation.data.to : 1}
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
