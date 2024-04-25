"use client";

import { LeftSideBar } from "./left-sidebar";
import { RightSideBar } from "./right-sidebar";
import { ToolBar } from "./tool-bar";
import { TimelineEditor } from "./timeline-editor";
import { Viewport } from "./viewport";

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
