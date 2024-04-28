import { action } from "mobx";
import React, { useMemo } from "react";
import { Vec2 } from "paintvec";
import { observer } from "mobx-react-lite";
import { NodeResizeBoxState } from "./node-resize-box-state";
import { useEditorState } from "../use-editor-state";
import twColors from "tailwindcss/colors";
import { ResizeBox } from "@/editor/components/resize-box/resize-box";

export const NodeResizeBox: React.FC = observer(function NodeResizeBox() {
  const editorState = useEditorState();

  const state = useMemo(
    () => new NodeResizeBoxState(editorState),
    [editorState]
  );

  if (editorState.shouldHideResizeBox) {
    return null;
  }

  const boundingBox = state.viewportBoundingBox;
  if (!boundingBox) {
    return null;
  }

  if (editorState.isReadonly) {
    return (
      <rect
        {...boundingBox.toSVGRectProps()}
        fill="none"
        stroke={twColors.blue[500]}
      />
    );
  }

  return (
    <g
      pointerEvents="visiblePainted"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (state.selectedNodes.length) {
          // showNodeContextMenu(editorState, state.selectedNodes[0], e);
        }
      }}
    >
      <ResizeBox
        p0={boundingBox.topLeft}
        p1={boundingBox.bottomRight}
        snap={action((p: Vec2) => {
          // TODO: avoid transform
          const { viewportToDocument, documentToViewport } = editorState.scroll;
          const pos = p.transform(viewportToDocument).round;
          // TODO: snapping
          // pos = viewportState.snapper.snapResizePoint(state.selectedNodes, pos);
          return pos.transform(documentToViewport);
        })}
        onChangeBegin={action(state.begin.bind(state))}
        onChange={action(state.change.bind(state))}
        onChangeEnd={action(state.end.bind(state))}
        stroke={state.stroke}
      />
    </g>
  );
});
