import { Command } from "./command";
import { Commands } from "./commands";
import { computed, makeObservable } from "mobx";
import { KeyGesture } from "@/utils/key-gesture";

export class ZoomInCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Zoom In";
  }

  @computed get shortcuts() {
    return [
      new KeyGesture([], "Equal"),
      new KeyGesture([], "NumpadAdd"),
      new KeyGesture(["Mod"], "Equal"),
      new KeyGesture(["Mod"], "NumpadAdd"),
      new KeyGesture(["Shift"], "Equal"),
      new KeyGesture(["Shift", "Mod"], "Equal"),
    ];
  }

  run() {
    this.editorState.scroll.zoomIn();
  }
}

export class ZoomOutCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Zoom Out";
  }

  @computed get shortcuts() {
    return [
      new KeyGesture([], "Minus"),
      new KeyGesture([], "NumpadSubtract"),
      new KeyGesture(["Mod"], "Minus"),
      new KeyGesture(["Mod"], "NumpadSubtract"),
      new KeyGesture(["Shift"], "Minus"),
      new KeyGesture(["Shift", "Mod"], "Minus"),
    ];
  }

  run() {
    this.editorState.scroll.zoomOut();
  }
}

export class ResetZoomCommand extends Command {
  constructor(commands: Commands) {
    super(commands);
    makeObservable(this);
  }

  @computed get text() {
    return "Reset Zoom";
  }

  @computed get shortcuts() {
    return [
      new KeyGesture(["Mod"], "Digit0"),
      new KeyGesture(["Mod"], "Numpad0"),
    ];
  }

  run() {
    this.editorState.scroll.resetZoom();
  }
}
