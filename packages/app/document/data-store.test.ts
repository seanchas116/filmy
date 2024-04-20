import { describe, it, expect, vi } from "vitest";
import { DataStore } from "./data-store";

describe(DataStore, () => {
  it("sets value to object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = new DataStore<any>();

    store.set("a", 1);
    expect(store.root).toEqual({ a: 1 });

    store.set("a/b", 2);
    expect(store.root).toEqual({ a: { b: 2 } });

    store.set("a/b/c", 3);
    expect(store.root).toEqual({
      a: { b: { c: 3 } },
    });

    store.set("a/b/d", 4);
    expect(store.root).toEqual({
      a: { b: { c: 3, d: 4 } },
    });

    store.root = {
      foo: "bar",
    };

    expect(store.root).toEqual({ foo: "bar" });
  });

  it("emits change event", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = new DataStore<any>();
    const listener = vi.fn();
    store.onChange("a", listener);

    store.set("a", 1);
    expect(listener).toHaveBeenCalledWith(1, null);

    store.set("a/b/c", 2);
    expect(listener).toHaveBeenCalledWith({ b: { c: 2 } }, 1);
  });

  it("emits update event", () => {
    const store = new DataStore<{
      a: { b: number; c: number };
    }>();

    const listener = vi.fn();
    store.onChange("a", listener);

    store.set("a/b", 1);
    expect(listener).toHaveBeenCalledWith({ b: 1 }, null);

    store.set("a/b", 2);
    expect(listener).toHaveBeenCalledWith({ b: 2 }, { b: 1 });

    store.set("a/c", 3);
    expect(listener).toHaveBeenCalledWith({ b: 2, c: 3 }, { b: 2 });
  });
});
