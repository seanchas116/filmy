import { DragHandler } from "./drag-handler";
import { ViewportEvent } from "./viewport-event";
import { nanoid } from "nanoid";
import { Node } from "@/document/node";
import { EditorState } from "@/editor/state/editor-state";
import twColors from "tailwindcss/colors";

export class InsertDragHandler implements DragHandler {
  constructor(event: ViewportEvent, type: "rectangle" | "ellipse" | "text") {
    this.editorState = event.editorState;
    this.type = type;
    this.startX = event.pos.x;
    this.startY = event.pos.y;

    const document = event.document;
    let root = this.editorState.document.selection.currentScene?.node;
    if (!root || root.type !== "group") {
      // create new group
      root = document.nodes.add(nanoid(), {
        order: 0,
        type: "group",
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      });
      const track = document.tracks.add(nanoid(), {
        sequence: document.currentSequence.id,
        order: 0,
        name: "Track 1",
      });
      document.trackItems.add(root.id, {
        track: track.id,
        start: this.editorState.currentTime,
        duration: 1000,
      });
    }

    this.node = document.nodes.add(nanoid(), {
      parent: root.id,
      order: root.children.length,
      ...(type === "rectangle"
        ? {
            type: "rectangle",
            fill: {
              type: "solid",
              hex: twColors.blue[500],
            },
            stroke: {
              width: 1,
              fill: {
                type: "solid",
                hex: "#000000",
              },
            },
          }
        : type === "ellipse"
          ? {
              type: "ellipse",
              fill: {
                type: "solid",
                hex: twColors.blue[500],
              },
              stroke: {
                width: 1,
                fill: {
                  type: "solid",
                  hex: "#000000",
                },
              },
            }
          : {
              type: "text",
              text: "Text",
              fontFamily: "Arial",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 150,
              fill: {
                type: "solid",
                hex: "#000000",
              },
              stroke: {
                width: 2,
                fill: {
                  type: "solid",
                  hex: "#000000",
                },
              },
            }),
      x: event.pos.x,
      y: event.pos.y,
      w: 100,
      h: 100,
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
    this.editorState.document.undoManager.commit();
  }
}
