import { Command } from "./command";
import { computed, makeObservable, runInAction } from "mobx";
import { Commands } from "./commands";
import { isTextInput } from "@/utils/is-text-input";
import { KeyGesture } from "@/utils/key-gesture";
import { Node } from "@/document/node";
import { Document } from "@/document/document";
import { NodeTreeData } from "@/document/node-tree-data";

const dataMimeType = "application/vnd.filmy+json";

async function copyNodes(nodes: readonly Node[]) {
  const trees = nodes.map((node) => node.toTreeData());
  const data = JSON.stringify(trees);

  await navigator.clipboard.write([
    new ClipboardItem({
      [`web ${dataMimeType}`]: new Blob([data], {
        type: dataMimeType,
      }),
    }),
  ]);
}

async function pasteNodes(document: Document) {
  const clipboardItems = await navigator.clipboard.read();
  for (const clipboardItem of clipboardItems) {
    if (clipboardItem.types.includes(`web ${dataMimeType}`)) {
      const blob = await clipboardItem.getType(`web ${dataMimeType}`);
      const json = await blob.text();
      const trees = JSON.parse(json) as NodeTreeData[];

      const nodes = trees.map((tree) => Node.fromTreeData(document, tree));
      document.selection.insertNodesAfterSelection(nodes);
    }
  }
}

export class UndoCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Undo";
  }
  // @computed get enabled() {
  //    return this.editorState.undoManager.canUndo;
  // }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }
  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyZ")];
  }
  run() {
    this.editorState.document.undoManager.undo();
  }
}

export class RedoCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Redo";
  }
  // @computed get enabled() {
  //   return this.editorState.undoManager.canRedo;
  // }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }
  @computed get shortcuts() {
    return [
      new KeyGesture(["Mod", "Shift"], "KeyZ"),
      new KeyGesture(["Shift"], "KeyY"),
    ];
  }
  run() {
    this.editorState.document.undoManager.redo();
  }
}

export class CopyCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Copy";
  }
  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyC")];
  }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }
  async run() {
    await copyNodes(this.editorState.document.selection.nodes);
  }
}

export class CutCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Cut";
  }
  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyX")];
  }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }
  async run() {
    await copyNodes(this.editorState.document.selection.nodes);
    runInAction(() => {
      this.editorState.document.selection.deleteSelected();
      this.editorState.document.undoManager.commit();
    });
  }
}

export class PasteCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Paste";
  }
  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyV")];
  }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }

  async run() {
    await pasteNodes(this.editorState.document);
    runInAction(() => {
      this.editorState.document.undoManager.commit();
    });
  }
}

export class DuplicateCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Duplicate";
  }
  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyD")];
  }
  run() {
    throw new Error("Method not implemented.");
    // const dups = this.editorState.selectedNodes.map((n) => n.clone());
    // this.editorState.insertAfterSelection(dups);
    // this.editorState.replaceSelection(dups);
    // this.editorState.commitUndo();
  }
}

export class DeleteCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Delete";
  }

  @computed get shortcuts() {
    return [new KeyGesture([], "Delete"), new KeyGesture([], "Backspace")];
  }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }

  run() {
    this.editorState.document.selection.deleteSelected();
    this.editorState.document.undoManager.commit();
  }
}

export class SelectAllCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Select All";
  }

  @computed get shortcuts() {
    return [new KeyGesture(["Mod"], "KeyA")];
  }
  @computed get shouldHandleShortcut() {
    return !isTextInput(document.activeElement);
  }

  run() {
    this.editorState.document.selection.selectAllSiblings();
  }
}
