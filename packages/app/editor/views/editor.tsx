"use client";

import { LeftSideBar } from "./left-sidebar/left-sidebar";
import { RightSideBar } from "./right-sidebar/right-sidebar";
import { ToolBar } from "./tool-bar/tool-bar";
import { MotionEditor, TrackEditor } from "./timeline/timeline-editor";
import { Viewport } from "./viewport/viewport";
import { useKeyHandling } from "./use-key-handling";
import { ContextMenuHost } from "../components/context-menu-host";
import { observer } from "mobx-react-lite";
import { TimelineTools } from "./timeline/timeline-tools";
import { useEditorState } from "./use-editor-state";

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
        {editorState.mode === "animate" && <MotionEditor />}
        <TrackEditor />
      </div>
      <ContextMenuHost />
    </div>
  );
});
