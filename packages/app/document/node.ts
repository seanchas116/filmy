import { NodeData, PropertyAnimationData } from "./schema";
import { Rect, Vec2 } from "paintvec";
import { computed, makeObservable, observable } from "mobx";
import { Document } from "./document";
import { TrackItem } from "./track-item";
import { Animation } from "./animation";
import { lerp } from "@/utils/math";
import { UnitBezier } from "@/utils/easing";
import { NodeClipboardData } from "./clipboard-data";
import { omit } from "lodash-es";
import { nanoid } from "nanoid";

export class Node {
  constructor(document: Document, id: string) {
    this.document = document;
    this.id = id;
    makeObservable(this);
  }

  readonly document: Document;
  readonly id: string;

  @computed get data(): NodeData {
    return this.document.nodeStore.data.get(this.id)!;
  }

  set data(data: NodeData) {
    this.document.nodeStore.data.set(this.id, data);
  }

  @computed get type(): NodeData["type"] {
    return this.data.type;
  }

  @computed get children(): Node[] {
    return this.document.nodeParenting
      .getChildren(this.id)
      .items.map((id) => this.document.nodes.get(id));
  }

  childAt(index: number): Node | undefined {
    const id = this.document.nodeParenting.getChildren(this.id).items[index];
    return id ? this.document.nodes.get(id) : undefined;
  }

  @computed get parent(): Node | undefined {
    const parentId = this.data.parent;
    return parentId ? this.document.nodes.get(parentId) : undefined;
  }

  @computed get root(): Node {
    let node: Node = this;
    while (node.parent) {
      node = node.parent;
    }
    return node;
  }

  get trackItem(): TrackItem | undefined {
    return this.document.trackItems.safeGet(this.id);
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
      this.document.nodeParenting.getChildren(parentId).indices.get(this.id) ??
      -1
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
    return this.document.selectedNodeIDStore.data.has(this.id);
  }

  select(): void {
    for (const child of this.children) {
      child.deselect();
    }
    this.document.selectedNodeIDStore.data.set(this.id, true);

    const rootTrackItem = this.root.trackItem;
    if (rootTrackItem) {
      this.document.currentSceneStore.data.set("value", rootTrackItem.id);
    }
  }

  deselect(): void {
    this.document.selectedNodeIDStore.data.delete(this.id);
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
    return this.type === "group";
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

  delete() {
    const trackItem = this.trackItem;
    if (trackItem) {
      this.document.trackItemStore.data.delete(trackItem.id);
    }
    for (const child of this.children) {
      child.delete();
    }

    this.document.selectedNodeIDStore.data.delete(this.id);
    this.document.nodeStore.data.delete(this.id);
  }

  // Animations (sorted by start time)
  @computed get animations(): Animation[] {
    const animationIDs = this.document.animationParenting.getChildren(this.id);
    return animationIDs.items.map((id) => this.document.animations.get(id));
  }

  animatedDataAt(time: number): NodeData {
    // Apply property animations for each property
    const animationsForProperty = new Map<string, PropertyAnimationData[]>();

    for (const animation of this.animations) {
      if (animation.data.type === "property") {
        const property = animation.data.property;
        const animations = animationsForProperty.get(property) ?? [];
        animations.push(animation.data);
        animationsForProperty.set(property, animations);
      }
    }

    const data = { ...this.data };

    for (const [property, animations] of animationsForProperty) {
      const animationsStartDesc = animations.toSorted(
        (a, b) => b.start - a.start
      );
      const animationsEndDesc = animations.toSorted(
        (a, b) => a.start + a.duration - (b.start + b.duration)
      );

      const playingAnimation = animationsStartDesc.find(
        (animation) =>
          animation.start <= time && time < animation.start + animation.duration
      );

      const lastFinishedAnimation = animationsEndDesc.find(
        (animation) => animation.start + animation.duration <= time
      );

      if (!playingAnimation) {
        if (lastFinishedAnimation) {
          // eslint-disable-next-line
          (data as any)[property] = lastFinishedAnimation.to;
        }
        continue;
      }

      const startValue =
        playingAnimation.from ??
        lastFinishedAnimation?.to ??
        // eslint-disable-next-line
        Number((data as any)[property] ?? 0);

      const endValue = playingAnimation.to;

      const ratio = (time - playingAnimation.start) / playingAnimation.duration;
      const easedRatio = new UnitBezier(...playingAnimation.easing).solve(
        ratio
      );
      const value = lerp(startValue, endValue, easedRatio);

      // eslint-disable-next-line
      (data as any)[property] = value;
    }

    return data;
  }

  toClipboardData(): NodeClipboardData {
    return {
      ...this.data,
      children: this.children.map((child) => child.toClipboardData()),
      animations: this.animations.map((animation) => animation.data),
    };
  }

  static fromClipboardData(document: Document, data: NodeClipboardData) {
    const node = document.nodes.add(nanoid(), {
      ...omit(data, ["children", "animations"]),
      parent: undefined,
      order: 0,
    } as NodeData);

    const children = data.children.map((childData) =>
      this.fromClipboardData(document, childData)
    );
    node.insertBefore(children, undefined);

    return node;
  }
}

export function flattenGroup(nodes: Node[]): Node[] {
  return nodes.flatMap((node) =>
    node.type === "group" ? flattenGroup(node.children) : node
  );
}
