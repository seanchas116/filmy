import { Store } from "@/utils/store/store";
import { NodeData } from "./schema";
import { Parenting } from "@/utils/store/parenting";
import { InstanceManager } from "./instance-manager";
import { Rect } from "paintvec";

export class NodeManager extends InstanceManager<NodeData, Node> {
  constructor(store: Store<NodeData>) {
    super(store, (id) => new Node(this, id));
    this.parenting = new Parenting(store);
  }

  readonly parenting: Parenting<NodeData>;

  get roots() {
    return this.parenting.getRoots().items.map((id) => this.instances.get(id)!);
  }
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
    const data = this.data;
    return Rect.from({
      x: data.x,
      y: data.y,
      width: data.w,
      height: data.h,
    });
  }
}
