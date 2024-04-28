import { Node } from "@/document/node";
import { EditorState } from "@/editor/state/editor-state";
import { ScrollState } from "@/editor/state/scroll-state";
import { Vec2 } from "paintvec";

function clickableAncestor(
  editorState: EditorState,
  instanceAtPos: Node,
  type: "click" | "doubleClick"
): Node {
  const clickables = new Set<Node>();

  for (const selected of editorState.selectedNodes) {
    for (const descendantSelected of selected.ancestors) {
      const siblings = descendantSelected.parent?.children ?? [];
      for (const sibling of siblings) {
        clickables.add(sibling);
      }
    }
  }
  for (const node of editorState.document.currentPage.children) {
    clickables.add(node);
  }

  let instance = instanceAtPos;
  let innerInstance = instanceAtPos;

  for (;;) {
    if (clickables.has(instance)) {
      break;
    }
    const parent = instance.parent;
    if (!parent || parent.type === "page") {
      break;
    }
    if (
      parent.parent?.type === "page" &&
      !instance.boundingBox.equals(parent.boundingBox)
    ) {
      // select second-level elements
      // if the bounding boxes of the top-level one and the second-level one are different
      break;
    }

    innerInstance = instance;
    instance = parent;
  }

  if (type === "doubleClick") {
    return innerInstance;
  }

  return instance;
}

export interface NodePicker {
  nodesFromPoint(clientPos: Vec2): Node[];
}

export class ViewportEvent {
  constructor(
    editorState: EditorState,
    nodePicker: NodePicker,
    event: MouseEvent | DragEvent,
    options: {
      all?: readonly Node[];
      clientPos?: Vec2;
      pos?: Vec2;
      mode?: "click" | "doubleClick";
    } = {}
  ) {
    this.editorState = editorState;

    const clientPos =
      options.clientPos ?? new Vec2(event.clientX, event.clientY);

    this.nodesIncludingLocked =
      options.all ?? nodePicker.nodesFromPoint(clientPos) ?? [];
    this.nodes = this.nodesIncludingLocked.filter((s) => !s.insideLocked);

    this.clientPos = clientPos;
    this.pos =
      options.pos ?? editorState.scroll.documentPosForClientPos(clientPos);
    this.event = event;
    this.mode = options.mode ?? "click";
  }

  readonly editorState: EditorState;
  readonly nodesIncludingLocked: readonly Node[];
  readonly nodes: readonly Node[];
  readonly clientPos: Vec2;
  readonly pos: Vec2;
  readonly event: MouseEvent | DragEvent;
  readonly mode: "click" | "doubleClick";

  get scroll(): ScrollState {
    return this.editorState.scroll;
  }

  get clickableNode(): Node | undefined {
    const instance = this.nodes[0];
    if (instance) {
      return clickableAncestor(this.editorState, instance, "click");
    }
  }

  get doubleClickableNode(): Node | undefined {
    const instance = this.nodes[0];
    if (instance) {
      return clickableAncestor(this.editorState, instance, "doubleClick");
    }
  }

  get node(): Node | undefined {
    if (this.mode === "doubleClick") {
      return this.doubleClickableNode;
    }

    return this.event.metaKey || this.event.ctrlKey
      ? this.deepestNode
      : this.clickableNode;
  }

  get deepestNode(): Node | undefined {
    return this.nodes[0];
  }
}
