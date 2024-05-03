import { computed, makeObservable } from "mobx";
import { Vec2, Rect, Transform } from "paintvec";
import twColors from "tailwindcss/colors";
import { EditorState } from "../../state/editor-state";
import { Node, flattenGroup } from "@/document/node";
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
    this.originalRect = node.globalBoundingBox;
  }

  resize(
    newRect: Rect,
    // TODO: use changes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    changes: {
      x: boolean;
      y: boolean;
      width: boolean;
      height: boolean;
    }
  ) {
    this.node.globalBoundingBox = newRect;
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

  get nodes(): Node[] {
    return flattenGroup(this.editorState.document.selection.nodes);
  }

  @computed get stroke(): string {
    return twColors.blue[500];
  }

  @computed get boundingBox(): Rect | undefined {
    return Rect.union(...this.nodes.map((n) => n.globalBoundingBox));
  }

  @computed get viewportBoundingBox(): Rect | undefined {
    return this.boundingBox?.transform(
      this.editorState.scroll.documentToViewport
    );
  }

  begin() {
    this.resizers = this.nodes.map((node) => new ElementResizer(node));
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

    this.editorState.document.undoManager.commit();
  }
}
