import { computed, makeObservable } from "mobx";
import { MoveByDirectionCommand, directions } from "./move-by-direction";
import {
  CopyCommand,
  CutCommand,
  DeleteCommand,
  DuplicateCommand,
  PasteCommand,
  RedoCommand,
  UndoCommand,
  SelectAllCommand,
} from "./edit";
import {
  InsertRectangleCommand,
  InsertImageCommand,
  InsertTextCommand,
  InsertOvalCommand,
} from "./insert";
import { GroupCommand, UngroupCommand } from "./node";
import { ResetZoomCommand, ZoomInCommand, ZoomOutCommand } from "./view";
import { Command } from "./command";
import { Node } from "@/document/node";
import { EditorState } from "../state/editor-state";
import { MenuSubTemplate, MenuTemplate } from "@/utils/menu-template";
import { isTextInput } from "@/utils/is-text-input";
import { getOrCreate } from "@/utils/get-or-create";

const instances = new WeakMap<EditorState, Commands>();

export class Commands {
  static get(editorState: EditorState): Commands {
    return getOrCreate(instances, editorState, () => new Commands(editorState));
  }

  private constructor(editorState: EditorState) {
    this.editorState = editorState;

    for (const dir of directions) {
      new MoveByDirectionCommand(this, dir, false);
      new MoveByDirectionCommand(this, dir, true);
    }

    makeObservable(this);
  }

  readonly editorState: EditorState;
  readonly commands: Command[] = [];

  readonly undoCommand = new UndoCommand(this);
  readonly redoCommand = new RedoCommand(this);

  readonly cutCommand = new CutCommand(this);
  readonly copyCommand = new CopyCommand(this);
  readonly pasteCommand = new PasteCommand(this);
  readonly duplicateCommand = new DuplicateCommand(this);
  readonly deleteCommand = new DeleteCommand(this);
  readonly selectAllCommand = new SelectAllCommand(this);

  readonly insertRectangleCommand = new InsertRectangleCommand(this);
  readonly insertOvalCommand = new InsertOvalCommand(this);
  readonly insertTextCommand = new InsertTextCommand(this);
  readonly insertImageCommand = new InsertImageCommand(this);

  readonly groupCommand = new GroupCommand(this);
  readonly ungroupCommand = new UngroupCommand(this);

  readonly zoomInCommand = new ZoomInCommand(this);
  readonly zoomOutCommand = new ZoomOutCommand(this);
  readonly resetZoomCommand = new ResetZoomCommand(this);

  @computed get mainMenus(): MenuSubTemplate[] {
    return [
      // this.fileMenu,
      this.editMenu,
      this.createMenu,
      this.nodeMenu,
      this.viewMenu,
    ];
  }

  @computed get editMenu(): MenuSubTemplate {
    return {
      type: "sub",
      text: "Edit",
      children: [
        this.undoCommand.menu,
        this.redoCommand.menu,
        { type: "separator" },
        this.cutCommand.menu,
        this.copyCommand.menu,
        this.pasteCommand.menu,
        this.duplicateCommand.menu,
        this.deleteCommand.menu,
        { type: "separator" },
        this.selectAllCommand.menu,
      ],
    };
  }

  @computed get createMenu(): MenuSubTemplate {
    return {
      type: "sub",
      text: "Create",
      children: [
        this.insertRectangleCommand.menu,
        this.insertOvalCommand.menu,
        this.insertTextCommand.menu,
        this.insertImageCommand.menu,
        // { type: "separator" },
        // {
        //   type: "command",
        //   text: "Generate Example Nodes",
        //   onClick: action(() => {
        //     const page = projectState.page;
        //     if (!page) {
        //       return;
        //     }
        //     generateExampleNodes(page.node);
        //     projectState.undoManager.stopCapturing();
        //   }),
        // },
      ],
    };
  }

  @computed get nodeMenu(): MenuSubTemplate {
    return {
      type: "sub",
      text: "Node",
      children: [this.groupCommand.menu, this.ungroupCommand.menu],
    };
  }

  @computed get viewMenu(): MenuSubTemplate {
    return {
      type: "sub",
      text: "View",
      children: [
        this.zoomInCommand.menu,
        this.zoomOutCommand.menu,
        this.resetZoomCommand.menu,
      ],
    };
  }

  contextMenuForNode(_node: Node): MenuTemplate[] {
    return [
      this.cutCommand.menu,
      this.copyCommand.menu,
      this.pasteCommand.menu,
      this.deleteCommand.menu,
      this.duplicateCommand.menu,
      { type: "separator" },
      ...this.nodeMenu.children,
    ];
  }

  handleCommand(event: KeyboardEvent): boolean {
    for (const command of this.commands) {
      if (
        !command.enabled ||
        !command.shortcuts ||
        !command.shouldHandleShortcut
      ) {
        continue;
      }
      for (const shortcut of command.shortcuts) {
        if (shortcut.matches(event)) {
          void command.run();
          return true;
        }
      }
    }
    return false;
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    // if (dialogState.isAnyOpen) {
    //   return false;
    // }

    if (event.key === " ") {
      this.editorState.panMode = true;

      // Prevent space from pressing buttons etc
      if (!isTextInput(event.target)) {
        return true;
      }
    }
    if (event.key === "Alt") {
      this.editorState.measureMode = true;
    }

    if (event.key === "Escape") {
      this.editorState.tool = undefined;
      return true;
    }

    if (
      event.ctrlKey ||
      event.metaKey ||
      !isTextInput(document.activeElement)
    ) {
      return this.handleCommand(event);
    }

    return false;
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === " ") {
      this.editorState.panMode = false;
      if (!isTextInput(event.target)) {
        this.editorState.togglePlay();
      }
    }
    if (event.key === "Alt") {
      this.editorState.measureMode = false;
    }
  }
}
