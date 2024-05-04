import { observer } from "mobx-react-lite";
import React from "react";
import { useRevealSelectedRow } from "./use-reveal-selected-row";
import { NodeTreeViewItem } from "./node-tree-view-item";
import { useEditorState } from "../use-editor-state";
import { TreeView } from "@/editor/components/treeview/tree-view";

export const NodeTreeView: React.FC = observer(() => {
  const editorState = useEditorState();
  const currentScene = editorState.document.selection.currentScene;

  useRevealSelectedRow();

  if (
    !currentScene ||
    editorState.currentTime < currentScene.start ||
    currentScene.duration + currentScene.start < editorState.currentTime
  ) {
    return;
  }
  const rootItem = NodeTreeViewItem.get(editorState, currentScene.node);

  return <TreeView rootItem={rootItem} />;
});
