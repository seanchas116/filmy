import { Rect, Vec2 } from "paintvec";
import { DragHandler } from "./drag-handler";
import { ViewportEvent } from "./viewport-event";
import { Node } from "@/document/node";

export class MoveDragHandler implements DragHandler {
  constructor(event: ViewportEvent, initPos: Vec2) {
    this.initPos = initPos;
    const targets = event.editorState.document.selectedNodes;
    for (const target of targets) {
      this.initialRects.set(target, target.boundingBox);
    }
  }

  move(event: ViewportEvent): void {
    const offset = event.pos.sub(this.initPos);
    for (const [target, initialRects] of this.initialRects) {
      target.boundingBox = initialRects.translate(offset);
    }
  }

  end() {}

  initPos: Vec2;
  initialRects = new Map<Node, Rect>();
}
