import { KeyGesture } from "@/utils/key-gesture";
import { Command } from "./command";
import { Commands } from "./commands";
import { computed, makeObservable } from "mobx";

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
    throw new Error("Not implemented");

    // const group = autoLayout.groupIntoLayout(
    //   this.viewportState.measureFunc,
    //   this.targets
    // );
    // if (group) {
    //   this.editorState.replaceSelection([group]);
    // }

    // this.editorState.commitUndo();
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
    throw new Error("Not implemented");

    // const nodes = this.targets;

    // this.editorState.replaceSelection([]);

    // for (const node of nodes) {
    //   const children = node.children;
    //   for (const child of children) {
    //     child.select();
    //   }
    //   autoLayout.ungroup(this.viewportState.measureFunc, node);
    // }

    // this.editorState.commitUndo();
  }
}
