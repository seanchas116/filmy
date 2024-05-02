import { Vec2 } from "paintvec";
import { DragHandler } from "./drag-handler";
import { ViewportEvent } from "./viewport-event";
import { Node } from "@/document/node";
import { dragStartThreshold } from "@/editor/state/thresholds";
import { MoveDragHandler } from "./move-drag-handler";

export class ClickMoveDragHandler implements DragHandler {
  static create(event: ViewportEvent): ClickMoveDragHandler | undefined {
    const node = event.node;
    if (node) {
      return new ClickMoveDragHandler(node, event);
    }
  }

  private constructor(node: Node, event: ViewportEvent) {
    this.initClientPos = new Vec2(event.event.clientX, event.event.clientY);
    this.initPos = event.pos;
    this.node = node;
    this.additive = event.event.shiftKey;

    if (event.nodes.every((r) => !r.ancestorSelected)) {
      if (!this.additive) {
        event.editorState.document.deselectAllNodes();
      }
      this.node.select();
    }
  }

  move(event: ViewportEvent): void {
    if (!this.moveHandler) {
      if (event.editorState.isReadonly) {
        return;
      }
      if (event.clientPos.sub(this.initClientPos).length < dragStartThreshold) {
        return;
      }

      this.moveHandler = new MoveDragHandler(event, this.initPos);
    }

    this.moveHandler?.move(event);
  }

  end(event: ViewportEvent): void {
    this.moveHandler?.end(event);
    if (!this.moveHandler) {
      // do click
      if (!this.additive) {
        event.editorState.document.deselectAllNodes();
      }
      this.node.select();
    }
    event.editorState.document.undoManager.commit();
  }

  private readonly initPos: Vec2;
  private readonly initClientPos: Vec2;
  private readonly node: Node;
  private readonly additive: boolean;
  private moveHandler: DragHandler | undefined;
}
