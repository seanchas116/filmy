import { computed, makeObservable } from "mobx";
import { Vec2, Rect, Transform } from "paintvec";
import twColors from "tailwindcss/colors";
import { EditorState } from "../../state/editor-state";
import { Node } from "@/document/node";
import { assertNonNull } from "@/utils/assert";

function roundRectXYWH(rect: Rect): Rect {
  return Rect.from({
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.max(Math.round(rect.width), 1),
    height: Math.max(Math.round(rect.height), 1),
  });
}

class ElementResizer {
  constructor(node: Node) {
    this.node = node;
    this.originalRect = node.boundingBox;
  }

  resize(
    newRect: Rect,
    changes: {
      x: boolean;
      y: boolean;
      width: boolean;
      height: boolean;
    }
  ) {
    const shape = this.node.shape;
    if (!shape) {
      return;
    }

    switch (shape.type) {
      case "ellipse":
      case "rectangle":
        this.node.shape = {
          ...shape,
          x: changes.x ? newRect.left : shape.x,
          y: changes.y ? newRect.top : shape.y,
          w: changes.width ? newRect.width : shape.w,
          h: changes.height ? newRect.height : shape.h,
        };
        break;
      case "text":
        this.node.shape = {
          ...shape,
          x: changes.x ? newRect.left : shape.x,
          y: changes.y ? newRect.top : shape.y,
        };
        break;
    }
  }

  finish() {
    // no op
  }

  readonly node: Node;
  readonly originalRect: Rect;
}

export class NodeResizeBoxState {
  constructor(editorState: EditorState) {
    this.editorState = editorState;
    makeObservable(this);
  }

  private editorState: EditorState;
  private initWholeBoundingBox = new Rect();
  private resizers: ElementResizer[] = [];
  private leftChanged = false;
  private topChanged = false;
  private widthChanged = false;
  private heightChanged = false;

  get selectedNodes(): Node[] {
    return this.editorState.selectedNodes;
  }

  @computed get stroke(): string {
    return twColors.blue[500];
  }

  @computed get boundingBox(): Rect | undefined {
    return Rect.union(...this.selectedNodes.map((n) => n.boundingBox));
  }

  @computed get viewportBoundingBox(): Rect | undefined {
    return this.boundingBox?.transform(
      this.editorState.scroll.documentToViewport
    );
  }

  begin() {
    this.resizers = this.selectedNodes.map((node) => new ElementResizer(node));
    this.initWholeBoundingBox = this.boundingBox ?? new Rect();
    this.leftChanged = false;
    this.topChanged = false;
    this.widthChanged = false;
    this.heightChanged = false;
  }

  change(p0: Vec2, p1: Vec2) {
    const newWholeBBox = assertNonNull(Rect.boundingRect([p0, p1])).transform(
      this.editorState.scroll.viewportToDocument
    );

    if (
      Math.round(newWholeBBox.left) !==
      Math.round(this.initWholeBoundingBox.left)
    ) {
      this.leftChanged = true;
    }
    if (
      Math.round(newWholeBBox.top) !== Math.round(this.initWholeBoundingBox.top)
    ) {
      this.topChanged = true;
    }
    if (
      Math.round(newWholeBBox.width) !==
      Math.round(this.initWholeBoundingBox.width)
    ) {
      this.widthChanged = true;
    }
    if (
      Math.round(newWholeBBox.height) !==
      Math.round(this.initWholeBoundingBox.height)
    ) {
      this.heightChanged = true;
    }
    const transform = Transform.rectToRect(
      this.initWholeBoundingBox,
      newWholeBBox
    );

    for (const resizer of this.resizers) {
      const newBBox = roundRectXYWH(resizer.originalRect.transform(transform));
      resizer.resize(newBBox, {
        x: this.leftChanged,
        y: this.topChanged,
        width: this.widthChanged,
        height: this.heightChanged,
      });
    }
  }

  end() {
    this.resizers.forEach((resizer) => {
      resizer.finish();
    });
    this.resizers = [];

    if (!this.widthChanged && !this.heightChanged) {
      return;
    }

    this.editorState.commitUndo();
  }
}
