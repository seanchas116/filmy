import { Commands } from "./commands";
import { action, computed } from "mobx";
import { MenuItemTemplate } from "@/utils/menu-template";
import { EditorState } from "../state/editor-state";
import { KeyGesture } from "@/utils/key-gesture";

export abstract class Command {
  constructor(commands: Commands) {
    this.commands = commands;
    commands.commands.push(this);
  }
  readonly commands: Commands;
  get editorState(): EditorState {
    return this.commands.editorState;
  }

  abstract text: string;
  abstract run(): void | Promise<void>;

  get enabled() {
    return true;
  }
  get shortcuts(): KeyGesture[] | undefined {
    return undefined;
  }
  get shouldHandleShortcut(): boolean {
    return true;
  }

  @computed get menu(): MenuItemTemplate {
    return {
      type: "item",
      text: this.text,
      disabled: !this.enabled,
      shortcuts: this.shortcuts,
      onClick: action(() => {
        void this.run();
      }),
    };
  }
}
