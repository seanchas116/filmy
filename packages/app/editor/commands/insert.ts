import { KeyGesture } from "@/utils/key-gesture";
import { Command } from "./command";
import { Commands } from "./commands";
import { computed, makeObservable } from "mobx";

export class InsertBoxCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Box";
  }
  @computed get shortcuts() {
    return [new KeyGesture([], "KeyF"), new KeyGesture([], "KeyR")];
  }
  run() {
    this.editorState.tool = "rectangle";
  }
}

export class InsertTextCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Text";
  }
  @computed get shortcuts() {
    return [new KeyGesture([], "KeyT")];
  }
  run() {
    this.editorState.tool = "text";
  }
}

export class InsertImageCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Image";
  }
  run() {
    throw new Error("Method not implemented.");
  }
}
