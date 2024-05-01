import { NodeData } from "./schema";
import { Parenting } from "@/utils/store/parenting";
import { InstanceManager } from "./instance-manager";
import { Rect, Vec2 } from "paintvec";
import { computed, makeObservable } from "mobx";
import { Document } from "./document";

export class NodeManager extends InstanceManager<NodeData, Node> {
  constructor(document: Document) {
    super(document.nodeStore, (id) => new Node(document, id));
    this.parenting = new Parenting(
      document.nodeStore,
      (data) => data.parent,
      (data) => data.order
    );
  }

  readonly parenting: Parenting<NodeData>;

  get roots() {
    return this.parenting.getRoots().items.map((id) => this.instances.get(id)!);
  }
}

export class Node {
  constructor(document: Document, id: string) {
    this.document = document;
    this.manager = document.nodes;
    this.id = id;
    makeObservable(this);
  }

  readonly document: Document;
  readonly manager: NodeManager;
  readonly id: string;

  @computed get data(): NodeData {
    return this.manager.store.data.get(this.id)!;
  }

  set data(data: NodeData) {
    this.manager.store.data.set(this.id, data);
  }

  @computed get type(): NodeData["type"] {
    return this.data.type;
  }

  @computed get children(): Node[] {
    return this.manager.parenting
      .getChildren(this.id)
      .items.map((id) => this.manager.instances.get(id)!);
  }

  childAt(index: number): Node | undefined {
    const id = this.manager.parenting.getChildren(this.id).items[index];
    return id ? this.manager.instances.get(id) : undefined;
  }

  @computed get parent(): Node | undefined {
    const parentId = this.data.parent;
    return parentId ? this.manager.instances.get(parentId) : undefined;
  }

  @computed get root(): Node {
    let node: Node = this;
    while (node.parent) {
      node = node.parent;
    }
    return node;
  }

  @computed get ancestors(): Node[] {
    const parent = this.parent;
    if (!parent) {
      return [];
    }
    return [...parent.ancestors, parent];
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

  get insideLocked(): boolean {
    // TODO
    return false;
  }

  @computed get selected(): boolean {
    return this.document.selectedNodeIDs.has(this.id);
  }

  select(): void {
    for (const child of this.children) {
      child.deselect();
    }
    this.document.selectedNodeIDs.add(this.id);
  }

  deselect(): void {
    this.document.selectedNodeIDs.delete(this.id);
    for (const child of this.children) {
      child.deselect();
    }
  }

  @computed get ancestorSelected(): boolean {
    return this.selected || this.parent?.selected || false;
  }

  @computed get boundingBox(): Rect {
    const data = this.data;
    return Rect.from({
      x: data.x,
      y: data.y,
      width: data.w,
      height: data.h,
    });
  }

  set boundingBox(rect: Rect) {
    this.data = {
      ...this.data,
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
    };
  }

  @computed get globalBoundingBox(): Rect {
    const parent = this.parent;
    if (!parent) {
      return this.boundingBox;
    }
    return this.boundingBox.translate(parent.globalBoundingBox.topLeft);
  }

  set globalBoundingBox(rect: Rect) {
    const parentOffset = this.parent?.globalBoundingBox.topLeft ?? new Vec2(0);
    this.boundingBox = rect.translate(parentOffset.neg);
  }
}
