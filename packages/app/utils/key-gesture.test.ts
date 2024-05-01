import { describe, it, expect } from "vitest";
import { KeyGesture } from "./key-gesture";

describe(KeyGesture.name, () => {
  it("returns Electron accelerator", () => {
    expect(new KeyGesture(["Mod"], "KeyC").toElectronAccelerator()).toBe(
      "CommandOrControl+C"
    );
  });
});
