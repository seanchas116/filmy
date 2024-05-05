import { KeyGesture } from "@/utils/key-gesture";
import { Command } from "./command";
import { Commands } from "./commands";
import { computed, makeObservable } from "mobx";
import { nanoid } from "nanoid";

export class GroupCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Group";
  }

  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyG")];
  }

  @computed get enabled() {
    return this.targets.length > 0;
  }

  @computed get targets() {
    return this.editorState.document.selection.nodes;
  }

  run() {
    const document = this.editorState.document;

    const targets = this.targets;
    if (!targets.length) {
      return;
    }
    const parent = targets[0].parent;
    if (!parent) {
      return;
    }

    const group = document.nodes.add(nanoid(), {
      type: "group",
      name: "Group",
      parent: parent.id,
      order: (parent.childAt(0)?.order ?? 0) - 1,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });
    group.insertBefore(targets, undefined);
    group.expanded = true;

    document.selection.clearNodeSelection();
    group.select();
    document.undoManager.commit();
  }
}

export class UngroupCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Ungroup";
  }

  @computed get shortcuts() {
    return [new KeyGesture(["Mod", "Shift"], "KeyG")];
  }

  @computed get enabled() {
    return this.targets.length > 0;
  }

  @computed get targets() {
    return this.editorState.document.selection.nodes;
  }

  run() {
    const nodes = this.targets;
    const document = this.editorState.document;

    document.selection.clearNodeSelection();

    const parent = nodes[0].parent;
    if (!parent) {
      return;
    }

    for (const node of nodes) {
      const children = node.children;
      for (const child of children) {
        child.select();
      }

      parent.insertBefore(children, node);
    }

    for (const node of nodes) {
      node.delete();
    }

    document.undoManager.commit();
  }
}
