import { Vec2 } from "paintvec";
import { Command } from "./command";
import { Commands } from "./commands";
import { computed, makeObservable } from "mobx";
import { KeyGesture } from "@/utils/key-gesture";
import { EditorState } from "../state/editor-state";

export const directions = ["up", "down", "left", "right"] as const;
export type Direction = (typeof directions)[number];

export function moveByDirection(
  editorState: EditorState,
  direction: Direction,
  shiftKey: boolean
) {
  const nodes = editorState.document.selectedNodes;

  // absolute move
  const amount = shiftKey ? 8 : 1;

  let delta: Vec2;
  switch (direction) {
    case "up":
      delta = new Vec2(0, -amount);
      break;
    case "down":
      delta = new Vec2(0, amount);
      break;
    case "left":
      delta = new Vec2(-amount, 0);
      break;
    case "right":
      delta = new Vec2(amount, 0);
      break;
  }

  for (const node of nodes) {
    node.data = {
      ...node.data,
      x: node.data.x + delta.x,
      y: node.data.y + delta.y,
    };
  }
}

export class MoveByDirectionCommand extends Command {
  constructor(commands: Commands, direction: Direction, shiftKey: boolean) {
    super(commands);
    this.direction = direction;
    this.shiftKey = shiftKey;
    makeObservable(this);
  }

  readonly direction: Direction;
  readonly shiftKey: boolean;

  @computed get text() {
    // not shown in UI
    return "";
  }
  @computed get shortcuts() {
    const key = (() => {
      switch (this.direction) {
        case "up":
          return "ArrowUp";
        case "down":
          return "ArrowDown";
        case "left":
          return "ArrowLeft";
        case "right":
          return "ArrowRight";
      }
    })();

    if (this.shiftKey) {
      return [
        new KeyGesture(["Shift"], key),
        new KeyGesture(["Alt", "Shift"], key), // also triggers during alt key is pressed
      ];
    } else {
      return [
        new KeyGesture([], key),
        new KeyGesture(["Alt"], key), // also triggers during alt key is pressed
      ];
    }
  }

  run() {
    moveByDirection(this.editorState, this.direction, this.shiftKey);
  }
}
