import { Store } from "@/utils/store/store";
import { NodeData, NodeDetailData, ShapeData } from "./schema";
import { Parenting } from "@/utils/store/parenting";
import { InstanceManager } from "./instance-manager";
import { Rect } from "paintvec";

export class NodeManager extends InstanceManager<NodeData, Node> {
  constructor(store: Store<NodeData>) {
    super(store, (id) => new Node(this, id));
    this.parenting = new Parenting(store);
  }

  readonly parenting: Parenting<NodeData>;
}

export class Node {
  constructor(manager: NodeManager, id: string) {
    this.manager = manager;
    this.id = id;
  }

  readonly manager: NodeManager;
  readonly id: string;

  get data(): NodeData {
    return this.manager.store.data.get(this.id)!;
  }

  set data(data: NodeData) {
    this.manager.store.data.set(this.id, data);
  }

  get detail(): NodeDetailData | undefined {
    return this.data.detail;
  }

  set detail(detail: NodeDetailData | undefined) {
    this.data = {
      ...this.data,
      detail,
    };
  }

  get shape(): ShapeData | undefined {
    return this.detail?.shape;
  }

  set shape(shape: ShapeData) {
    this.detail = {
      ...this.detail,
      type: "shape",
      shape,
    };
  }

  get children(): Node[] {
    return this.manager.parenting
      .getChildren(this.id)
      .items.map((id) => this.manager.instances.get(id)!);
  }

  childAt(index: number): Node | undefined {
    const id = this.manager.parenting.getChildren(this.id).items[index];
    return id ? this.manager.instances.get(id) : undefined;
  }

  parent(): Node | undefined {
    const parentId = this.data.parent;
    return parentId ? this.manager.instances.get(parentId) : undefined;
  }

  indexOf(): number {
    const parentId = this.data.parent;
    if (!parentId) {
      return -1;
    }

    return (
      this.manager.parenting.getChildren(parentId).indices.get(this.id) ?? -1
    );
  }

  get boundingBox(): Rect {
    const shape = this.detail?.shape;
    if (!shape) {
      return Rect.from({ x: 0, y: 0, width: 0, height: 0 });
    }

    switch (shape.type) {
      case "rectangle":
      case "ellipse":
        return Rect.from({
          x: shape.x,
          y: shape.y,
          width: shape.w,
          height: shape.h,
        });
      case "text":
        return Rect.from({
          x: shape.x,
          y: shape.y,
          // TODO: measure text
          width: 100,
          height: 50,
        });
    }
  }
}
