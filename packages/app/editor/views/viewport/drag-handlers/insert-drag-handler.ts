import { DragHandler } from "./drag-handler";
import { ViewportEvent } from "./viewport-event";
import { assertNonNull } from "@/utils/assert";
import { nanoid } from "nanoid";
import { Node } from "@/document/node";
import { EditorState } from "@/editor/state/editor-state";

export class InsertDragHandler implements DragHandler {
  constructor(event: ViewportEvent, type: "rectangle" | "ellipse" | "text") {
    this.editorState = event.editorState;
    this.type = type;
    this.startX = event.pos.x;
    this.startY = event.pos.y;

    const document = event.document;
    const frame = assertNonNull(document.currentPage.childAt(0));

    this.node = document.nodes.add(nanoid(), {
      parent: frame.id,
      order: frame.children.length,
      ...(type === "rectangle"
        ? { type: "rectangle" }
        : type === "ellipse"
          ? { type: "ellipse" }
          : { type: "text", text: "Text" }),
      x: event.pos.x,
      y: event.pos.y,
      w: 100,
      h: 100,
      fill: {
        type: "solid",
        hex: "#ff0000",
      },
      stroke: {
        width: 1,
        fill: {
          type: "solid",
          hex: "#000000",
        },
      },
    });
  }

  type: "rectangle" | "ellipse" | "text";
  editorState: EditorState;
  node: Node;
  startX: number;
  startY: number;

  move(event: ViewportEvent): void {
    const node = this.node;

    const x1 = this.startX;
    const y1 = this.startY;
    const x2 = event.pos.x;
    const y2 = event.pos.y;

    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);

    if (node.data.type === "rectangle" || node.data.type === "ellipse") {
      node.data = { ...node.data, x, y, w, h };
    }
  }

  end(): void {
    this.editorState.tool = undefined;
  }
}
