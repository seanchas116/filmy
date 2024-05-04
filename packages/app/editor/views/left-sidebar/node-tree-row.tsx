import { Icon } from "@iconify/react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { elementForNode } from "./use-reveal-selected-row";
import { NodeTreeViewItem } from "./node-tree-view-item";
import { Node } from "@/document/node";
import { useEditorState } from "../use-editor-state";
import { ClickToEdit } from "@/editor/components/click-to-edit";
import { TrackItem } from "@/document/track-item";

export const NodeIcon: React.FC<{
  node: Node;
  selected?: boolean;
}> = observer(({ node }) => {
  switch (node.type) {
    case "rectangle":
      return (
        <Icon
          className="opacity-70"
          icon="material-symbols:square-outline-rounded"
        />
      );
    case "video":
      return (
        <Icon
          className="opacity-70"
          icon="material-symbols:smart-display-outline-rounded"
        />
      );
    case "group":
      return (
        <Icon className="opacity-70" icon="material-symbols:select-rounded" />
      );
    case "ellipse":
      return (
        <Icon className="opacity-70" icon="material-symbols:circle-outline" />
      );
    case "text":
      return (
        <Icon className="opacity-70" icon="material-symbols:title-rounded" />
      );
  }
});

NodeIcon.displayName = "NodeIcon";

export const TrackItemTreeRow: React.FC<{
  trackItem: TrackItem;
  item: NodeTreeViewItem;
}> = observer(({ trackItem }) => {
  return (
    <div className="flex-1 min-w-0 h-full flex items-center">
      <span className="mr-2 p-1 rounded-full">
        <Icon icon="material-symbols:view-timeline-outline" />
      </span>
      {trackItem.track.data.name}
    </div>
  );
});

export const NodeTreeRow: React.FC<{
  item: NodeTreeViewItem;
}> = observer(({ item }) => {
  const node = item.node;
  const editorState = useEditorState();

  const [isNameEditing, setNameEditing] = useState(false);

  const setHiddenLocked = (value: { hidden?: boolean; locked?: boolean }) => {
    const targets = node.selected
      ? editorState.document.selection.nodes
      : [node];

    for (const target of targets) {
      if (value.hidden !== undefined) {
        target.hidden = value.hidden;
      }
      if (value.locked !== undefined) {
        target.locked = value.locked;
      }
    }

    editorState.document.undoManager.commit();
  };

  return (
    <div
      ref={(element) => {
        if (element) {
          elementForNode.set(node, element);
        }
      }}
      className="flex-1 min-w-0 h-full flex items-center"
    >
      <span className="mr-2 p-1 rounded-full">
        <NodeIcon node={node} selected={node.selected} />
      </span>
      <ClickToEdit
        className="flex-1 min-w-0 truncate h-full"
        inputClassName="bg-white text-gray-800 outline-0 h-full w-full focus:ring-1 focus:ring-inset focus:ring-blue-500 rounded-r-lg"
        previewClassName="h-full w-full min-w-0 flex items-center truncate"
        editing={isNameEditing}
        onChangeEditing={setNameEditing}
        value={node.name}
        onChangeValue={action((value) => {
          node.name = value;
        })}
        disabled={editorState.isReadonly}
      />

      {!isNameEditing && !editorState.isReadonly && (
        <div className="absolute right-2 top-0 bottom-0 text-xs flex items-center">
          {node.locked ? (
            <button
              className="p-1"
              onMouseDown={action((e) => {
                e.stopPropagation();
                setHiddenLocked({
                  locked: false,
                });
              })}
            >
              <Icon icon="material-symbols:lock" />
            </button>
          ) : node.ancestorLocked ? (
            <button
              className="p-1 opacity-30"
              onMouseDown={action((e) => {
                e.stopPropagation();
                setHiddenLocked({
                  locked: true,
                });
              })}
            >
              <Icon icon="material-symbols:lock-outline" />
            </button>
          ) : (
            <button
              className="p-1 invisible group-hover:visible"
              onMouseDown={action((e) => {
                e.stopPropagation();
                setHiddenLocked({
                  locked: true,
                });
              })}
            >
              <Icon icon="material-symbols:lock-open-outline" />
            </button>
          )}
          {node.hidden ? (
            <button
              className="p-1"
              onMouseDown={action((e) => {
                e.stopPropagation();
                setHiddenLocked({
                  hidden: false,
                });
              })}
            >
              <Icon icon="icon-park-outline:preview-close" />
            </button>
          ) : (
            <button
              className="p-1 invisible group-hover:visible"
              onMouseDown={action((e) => {
                e.stopPropagation();
                setHiddenLocked({
                  hidden: true,
                });
              })}
            >
              <Icon icon="icon-park-outline:preview-open" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

NodeTreeRow.displayName = "ElementTreeRow";
