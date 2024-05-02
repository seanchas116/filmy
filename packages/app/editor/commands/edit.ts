import { Command } from "./command";
import { computed, makeObservable } from "mobx";
import { Commands } from "./commands";
import { isTextInput } from "@/utils/is-text-input";
import { KeyGesture } from "@/utils/key-gesture";

// const dataMimeType = "application/vnd.rera+json";

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
    throw new Error("Method not implemented.");
    // await copyNodes(this.editorState);
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
    throw new Error("Method not implemented.");
    // await copyNodes(this.editorState);
    // runInAction(() => {
    //   this.editorState.deleteSelection();
    //   this.editorState.commitUndo();
    // });
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
    throw new Error("Method not implemented.");
    // await toast.progress(
    //   async () => {
    //     await pasteNodes(this.editorState);
    //     runInAction(() => {
    //       this.editorState.commitUndo();
    //     });
    //   },
    //   {
    //     pending: "Pasting...",
    //     success: "Pasted",
    //     error: "Failed to paste",
    //   }
    // );
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
