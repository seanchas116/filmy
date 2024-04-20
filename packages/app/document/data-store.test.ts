import { describe, it, expect, vi } from "vitest";
import { DataStore } from "./data-store";

describe(DataStore, () => {
  it("sets value to object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = new DataStore<any>();

    store.set(["a"], 1);
    expect(store.get([])).toEqual({ a: 1 });

    store.set(["a", "b"], 2);
    expect(store.get([])).toEqual({ a: { b: 2 } });

    store.set(["a", "b", "c"], 3);
    expect(store.get([])).toEqual({
      a: { b: { c: 3 } },
    });

    store.set(["a", "b", "d"], 4);
    expect(store.get([])).toEqual({
      a: { b: { c: 3, d: 4 } },
    });

    store.set([], {
      foo: "bar",
    });

    expect(store.get([])).toEqual({ foo: "bar" });
  });

  it("emits change event", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = new DataStore<any>();
    const listener = vi.fn();
    store.onChange(["a"], listener);

    store.set(["a"], 1);
    expect(listener).toHaveBeenCalledWith(1);

    store.set(["a", "b", "c"], 2);
    expect(listener).toHaveBeenCalledWith({ b: { c: 2 } });
  });
});
