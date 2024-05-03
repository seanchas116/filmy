import { observer } from "mobx-react-lite";
import React from "react";
import { useRevealSelectedRow } from "./use-reveal-selected-row";
import { NodeTreeViewItem } from "./node-tree-view-item";
import { useEditorState } from "../use-editor-state";
import { TreeView } from "@/editor/components/treeview/tree-view";

export const NodeTreeView: React.FC = observer(() => {
  const editorState = useEditorState();
  const root = editorState.document.selection.currentScene?.node;

  useRevealSelectedRow();

  if (!root) {
    return null;
  }

  const rootItem = NodeTreeViewItem.get(editorState, root);

  return <TreeView rootItem={rootItem} />;
});
