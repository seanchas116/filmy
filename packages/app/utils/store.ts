import { observable } from "mobx";
import { UndoStack } from "./undo-stack";
import { getOrAdd } from "./get-or-add";

export class Collection<T> {
  constructor() {}

  readonly data = observable.map<string, T>([], { deep: false });
}

export class UndoManager {
  constructor(collections: Collection<unknown>[]) {
    this.collections = collections;

    for (const collection of collections) {
      this.disposers.push(
        collection.data.observe_((change) => {
          if (change.type === "add") {
            this.stageChanges(
              collection,
              change.name,
              undefined,
              change.newValue
            );
          } else if (change.type === "delete") {
            this.stageChanges(
              collection,
              change.name,
              change.oldValue,
              undefined
            );
          } else {
            this.stageChanges(
              collection,
              change.name,
              change.oldValue,
              change.newValue
            );
          }
        })
      );
    }
  }

  dispose() {
    for (const disposer of this.disposers) {
      disposer();
    }
  }

  readonly disposers: (() => void)[] = [];
  readonly collections: Collection<unknown>[];
  private lastCommand: UndoManagerCommand | undefined;
  private undoStack = new UndoStack<UndoManagerCommand>();

  get canUndo(): boolean {
    return this.undoStack.canUndo;
  }

  get canRedo(): boolean {
    return this.undoStack.canRedo;
  }

  undo(): void {
    this.undoStack.undo();
    this.lastCommand = undefined;
  }

  redo(): void {
    this.undoStack.redo();
    this.lastCommand = undefined;
  }

  clear(): void {
    this.undoStack.clear();
    this.lastCommand = undefined;
  }

  commit(): void {
    this.lastCommand = undefined;
  }

  stageChanges(
    collection: Collection<unknown>,
    id: string,
    oldData: unknown,
    newData: unknown
  ) {
    if (!this.lastCommand || this.lastCommand.timestamp < Date.now() - 1000) {
      this.lastCommand = new UndoManagerCommand(this);
      this.undoStack.push(this.lastCommand);
    } else {
      this.lastCommand.timestamp = Date.now();
    }

    const changes = getOrAdd(
      this.lastCommand.changesForCollection,
      collection,
      () => new Map<string, { oldData: unknown; newData: unknown }>()
    );
    const staged = changes.get(id);
    if (staged) {
      staged.newData = newData;
    } else {
      changes.set(id, { oldData, newData });
    }
  }

  duringUndoRedo = false;
}

class UndoManagerCommand {
  constructor(undoManager: UndoManager) {
    this.undoManager = undoManager;
  }

  readonly undoManager: UndoManager;
  timestamp = Date.now();
  readonly changesForCollection = new Map<
    Collection<unknown>,
    Map<string, { oldData: unknown; newData: unknown }>
  >();

  undo() {
    try {
      console.debug("-- undo");
      this.undoManager.duringUndoRedo = true;

      for (const [collection, changes] of this.changesForCollection) {
        for (const [id, { oldData }] of changes) {
          if (oldData == null) {
            collection.data.delete(id);
          } else {
            collection.data.set(id, oldData);
          }
        }
      }
    } finally {
      this.undoManager.duringUndoRedo = false;
      console.debug("-- undo done");
    }
  }
  redo() {
    try {
      console.debug("-- redo");
      this.undoManager.duringUndoRedo = true;

      for (const [collection, changes] of this.changesForCollection) {
        for (const [id, { newData }] of changes) {
          if (newData == null) {
            collection.data.delete(id);
          } else {
            collection.data.set(id, newData);
          }
        }
      }
    } finally {
      this.undoManager.duringUndoRedo = false;
      console.debug("-- redo done");
    }
  }
}
