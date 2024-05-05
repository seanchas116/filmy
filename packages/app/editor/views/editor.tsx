"use client";

import { LeftSideBar } from "./left-sidebar/left-sidebar";
import { RightSideBar } from "./right-sidebar/right-sidebar";
import { ToolBar } from "./tool-bar/tool-bar";
import { AnimationEditor, TimelineEditor } from "./timeline/timeline-editor";
import { Viewport } from "./viewport/viewport";
import { useKeyHandling } from "./use-key-handling";
import { ContextMenuHost } from "../components/context-menu-host";
import { observer } from "mobx-react-lite";
import { useEditorState } from "./use-editor-state";
import { TimelineTools } from "./timeline/timeline-tools";

export const Editor = observer(() => {
  const editorState = useEditorState();
  useKeyHandling();

  return (
    <div className="grid grid-rows-[auto,1fr,auto] w-screen h-screen select-none">
      <ToolBar />
      <div className="grid grid-cols-[auto,1fr,auto]">
        <LeftSideBar />
        <Viewport />
        <RightSideBar />
      </div>
      <div className="flex flex-col">
        <TimelineTools />
        {editorState.mode === "animate" && <AnimationEditor />}
        <TimelineEditor />
      </div>
      <ContextMenuHost />
    </div>
  );
});
