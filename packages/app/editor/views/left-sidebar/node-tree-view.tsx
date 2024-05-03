import { observer } from "mobx-react-lite";
import React from "react";
import { useRevealSelectedRow } from "./use-reveal-selected-row";
import { RootTreeViewItem } from "./node-tree-view-item";
import { useEditorState } from "../use-editor-state";
import { TreeView } from "@/editor/components/treeview/tree-view";

export const NodeTreeView: React.FC = observer(() => {
  const editorState = useEditorState();

  useRevealSelectedRow();

  const rootItem = RootTreeViewItem.get(editorState);

  return <TreeView rootItem={rootItem} />;
});
