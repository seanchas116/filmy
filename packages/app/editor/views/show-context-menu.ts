import { Node } from "@/document/node";
import { EditorState } from "../state/editor-state";
import { Commands } from "../commands/commands";
import { showContextMenu } from "../components/context-menu-state";

export function showNodeContextMenu(
  editorState: EditorState,
  node: Node,
  e: MouseEvent | React.MouseEvent
) {
  e.preventDefault();
  showContextMenu(e, Commands.get(editorState).contextMenuForNode(node));
}
