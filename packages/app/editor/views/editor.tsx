"use client";

import { LeftSideBar } from "./left-sidebar/left-sidebar";
import { RightSideBar } from "./right-sidebar/right-sidebar";
import { ToolBar } from "./tool-bar/tool-bar";
import { TimelineEditor } from "./timeline/timeline-editor";
import { Viewport } from "./viewport/viewport";

export function Editor() {
  return (
    <div className="grid grid-rows-[auto,1fr,auto] w-screen h-screen">
      <ToolBar />
      <div className="grid grid-cols-[auto,1fr,auto]">
        <LeftSideBar />
        <Viewport />
        <RightSideBar />
      </div>
      <TimelineEditor />
    </div>
  );
}
