import { Command } from "./command";
import { computed, makeObservable, runInAction } from "mobx";
import { Commands } from "./commands";
import { isTextInput } from "@/utils/is-text-input";
import { KeyGesture } from "@/utils/key-gesture";
import { Node } from "@/document/node";
import { Document } from "@/document/document";
import {
  NodeClipboardData,
  TrackItemClipboardData,
} from "@/document/clipboard-data";

const dataMimeType = "application/vnd.filmy+json";

type ClipboardData =
  | {
      type: "nodes";
      nodes: NodeClipboardData[];
    }
  | {
      type: "trackItems";
      trackItems: TrackItemClipboardData[];
    };

async function copyToClipboard(document: Document) {
  const trackItems = document.selection.trackItems;
  if (trackItems.length) {
    const data: ClipboardData = {
      type: "trackItems",
      trackItems: trackItems.map((trackItem) => trackItem.toClipboardData()),
    };

    await navigator.clipboard.write([
      new ClipboardItem({
        [`web ${dataMimeType}`]: new Blob([JSON.stringify(data)], {
          type: dataMimeType,
        }),
      }),
    ]);
    return;
  }

  const nodes = document.selection.nodes;
  if (nodes.length) {
    const data: ClipboardData = {
      type: "nodes",
      nodes: nodes.map((node) => node.toClipboardData()),
    };

    await navigator.clipboard.write([
      new ClipboardItem({
        [`web ${dataMimeType}`]: new Blob([JSON.stringify(data)], {
          type: dataMimeType,
        }),
      }),
    ]);
    return;
  }
}

async function pasteNodes(document: Document, currentTime: number) {
  const clipboardItems = await navigator.clipboard.read();
  for (const clipboardItem of clipboardItems) {
    if (clipboardItem.types.includes(`web ${dataMimeType}`)) {
      const blob = await clipboardItem.getType(`web ${dataMimeType}`);
      const json = await blob.text();
      const data = JSON.parse(json) as ClipboardData;

      if (data.type === "nodes" && data.nodes.length) {
        const nodes = data.nodes.map((tree) =>
          Node.fromClipboardData(document, tree)
        );
        document.selection.insertNodesAfterSelection(nodes);
      } else if (data.type === "trackItems" && data.trackItems.length) {
        const minStartTime = Math.min(
          ...data.trackItems.map((trackItem) => trackItem.start)
        );

        const itemDataForTrack = new Map<string, TrackItemClipboardData[]>();
        for (const trackItem of data.trackItems) {
          const trackId = trackItem.track;
          if (!itemDataForTrack.has(trackId)) {
            itemDataForTrack.set(trackId, []);
          }
          itemDataForTrack.get(trackId)!.push(trackItem);
        }

        // crete new tracks and track items

        for (const [, trackItems] of itemDataForTrack) {
          const track = document.currentSequence.appendTrack({
            name: "Track",
          });

          for (const trackItemData of trackItems) {
            const node = Node.fromClipboardData(document, trackItemData.node);
            track.createItem(node, {
              start: trackItemData.start - minStartTime + currentTime,
              duration: trackItemData.duration,
            });
          }
        }
      }
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
    await copyToClipboard(this.editorState.document);
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
    await copyToClipboard(this.editorState.document);
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
    await pasteNodes(this.editorState.document, this.editorState.currentTime);
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
