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
      <div className="w-64 border-r border-gray-200 py-4">
        {animations.map((anim, i) => {
          return (
            <div
              key={i}
              className="p-1 px-4 h-8 flex items-center aria-selected:bg-blue-100 hover:bg-gray-100"
              aria-selected={anim.selected}
              onClick={action((e) => {
                if (!e.shiftKey) {
                  editorState.document.selection.clear();
                }
                anim.select();
                anim.node.select();
                editorState.playRange(
                  anim.data.start + (currentScene?.start ?? 0),
                  anim.data.duration,
                  4
                );
              })}
            >
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
          {animations.map((anim, i) => {
            const onBarMouseDown = action((e: React.MouseEvent) => {
              if (!e.shiftKey) {
                editorState.document.selection.clear();
              }
              anim.select();
              anim.node.select();
              editorState.playRange(
                anim.data.start + (currentScene?.start ?? 0),
                anim.data.duration,
                4
              );
              e.stopPropagation();

              const initClientX = e.clientX;
              const initStart = anim.data.start;

              const onMouseMove = action((e: MouseEvent) => {
                const totalDeltaX = e.clientX - initClientX;
                const start = Math.max(0, initStart + totalDeltaX / scale);

                anim.data = {
                  ...anim.data,
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
              const initStart = anim.data.start;
              const initDuration = anim.data.duration;

              const onMouseMove = action((e: MouseEvent) => {
                const totalDeltaX = e.clientX - initClientX;

                const start = Math.max(0, initStart + totalDeltaX / scale);
                const duration = Math.max(
                  0,
                  initDuration - totalDeltaX / scale
                );

                anim.data = {
                  ...anim.data,
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
              const initDuration = anim.data.duration;

              const onMouseMove = action((e: MouseEvent) => {
                const totalDeltaX = e.clientX - initClientX;

                const duration = Math.max(
                  0,
                  initDuration + totalDeltaX / scale
                );

                anim.data = {
                  ...anim.data,
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
                key={anim.id}
                className="absolute flex items-center justify-center text-xs group"
                aria-selected={anim.selected}
                style={{
                  left: ((currentScene?.start ?? 0) + anim.data.start) * scale,
                  width: anim.data.duration * scale,
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
                  {anim.data.type === "property" ? anim.data.from : 0}
                </div>
                <div
                  className="absolute right-0 top-0 bottom-0 my-auto w-fit h-6 px-2 leading-6 rounded-full bg-gray-200 group-aria-selected:bg-blue-500 group-aria-selected:text-white translate-x-1/2"
                  onMouseDown={onEndHandleMouseDown}
                >
                  {anim.data.type === "property" ? anim.data.to : 1}
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
