import { NodeData } from "./schema";
import { Parenting } from "@/utils/store/parenting";
import { InstanceManager } from "./instance-manager";
import { Rect, Vec2 } from "paintvec";
import { computed, makeObservable, observable } from "mobx";
import { Document } from "./document";

function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

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

  @computed get siblings(): Node[] {
    return this.parent?.children ?? [];
  }

  @computed get nextSibling(): Node | undefined {
    return this.siblings[this.index + 1];
  }

  @computed get previousSibling(): Node | undefined {
    return this.siblings[this.index - 1];
  }

  get index(): number {
    const parentId = this.data.parent;
    if (!parentId) {
      return -1;
    }

    return (
      this.manager.parenting.getChildren(parentId).indices.get(this.id) ?? -1
    );
  }

  @computed get indexPath(): number[] {
    const parent = this.parent;
    if (!parent) {
      return [];
    }
    return [...parent.indexPath, this.index];
  }

  includes(other: Node): boolean {
    return other.ancestors.includes(this);
  }

  insertBefore(
    nodes: readonly Node[],
    next: Node | undefined
  ): readonly Node[] {
    nodes = nodes.filter((node) => !node.includes(this));

    const children = this.children;
    const prev = children[(next?.index ?? children.length) - 1];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const order =
        prev && next
          ? lerp(prev.order ?? 0, next.order ?? 0, (i + 1) / (nodes.length + 1))
          : prev
            ? (prev.order ?? 0) + i + 1
            : next
              ? (next.order ?? 0) - nodes.length + i
              : i;

      node.data = {
        ...node.data,
        parent: this.id,
        order,
      };
    }

    return nodes;
  }

  get order(): number {
    return this.data.order;
  }

  get locked(): boolean {
    return this.data.locked ?? false;
  }

  set locked(locked: boolean) {
    this.data = { ...this.data, locked };
  }

  get ancestorLocked(): boolean {
    return this.locked || this.parent?.ancestorLocked || false;
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
    return this.selected || this.parent?.ancestorSelected || false;
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

  @observable expanded = false;

  expandAllAncestors() {
    let node = this.parent;
    while (node) {
      node.expanded = true;
      node = node.parent;
    }
  }

  @computed get mayHaveChildren() {
    return this.type === "frame";
  }

  @computed get hidden() {
    return this.data.hidden ?? false;
  }

  set hidden(hidden: boolean) {
    this.data = { ...this.data, hidden };
  }

  @computed get ancestorHidden(): boolean {
    return this.hidden || this.parent?.ancestorHidden || false;
  }

  @computed get name(): string {
    return this.data.name ?? this.data.type;
  }

  set name(name: string) {
    this.data = { ...this.data, name };
  }

  deleteRecursive() {
    for (const child of this.children) {
      child.deleteRecursive();
    }

    this.document.selectedNodeIDs.delete(this.id);
    this.document.nodeStore.data.delete(this.id);
  }
}
