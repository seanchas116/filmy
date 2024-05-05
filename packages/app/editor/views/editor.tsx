"use client";

import { LeftSideBar } from "./left-sidebar/left-sidebar";
import { RightSideBar } from "./right-sidebar/right-sidebar";
import { ToolBar } from "./tool-bar/tool-bar";
import { Viewport } from "./viewport/viewport";
import { useKeyHandling } from "./use-key-handling";
import { ContextMenuHost } from "../components/context-menu-host";
import { observer } from "mobx-react-lite";
import { TimelinePanel } from "./timeline/timeline-panel";

export const Editor = observer(() => {
  useKeyHandling();

  return (
    <div className="grid grid-rows-[auto,1fr,auto] w-screen h-screen select-none">
      <ToolBar />
      <div className="grid grid-cols-[auto,1fr,auto]">
        <LeftSideBar />
        <Viewport />
        <RightSideBar />
      </div>
      <TimelinePanel />
      <ContextMenuHost />
    </div>
  );
});
