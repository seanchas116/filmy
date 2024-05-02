import { KeyGesture } from "@/utils/key-gesture";
import { Command } from "./command";
import { Commands } from "./commands";
import { computed, makeObservable } from "mobx";

export class InsertRectangleCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Rectangle";
  }
  @computed get shortcuts() {
    return [new KeyGesture([], "KeyR"), new KeyGesture([], "KeyF")];
  }
  run() {
    this.editorState.tool = "rectangle";
  }
}

export class InsertOvalCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Oval";
  }
  @computed get shortcuts() {
    return [new KeyGesture([], "KeyO")];
  }
  run() {
    this.editorState.tool = "ellipse";
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
