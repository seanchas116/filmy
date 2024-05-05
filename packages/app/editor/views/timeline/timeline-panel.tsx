"use client";

import { observer } from "mobx-react-lite";
import { useEditorState } from "../use-editor-state";
import { TimelineTools } from "./timeline-tools";
import { TrackEditor } from "./track-editor";
import { AnimationEditor } from "./animation-editor";

export const TimelinePanel = observer(() => {
  const editorState = useEditorState();

  return (
    <div className="flex flex-col">
      <TimelineTools />
      {editorState.mode === "animate" && <AnimationEditor />}
      <TrackEditor />
    </div>
  );
});
