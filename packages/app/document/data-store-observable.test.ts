import { describe, expect, it, vi } from "vitest";
import { dataStoreObservable } from "./data-store-observable";
import { DataStore, DataValue } from "./data-store";
import { reaction } from "mobx";

describe(dataStoreObservable, () => {
  it("creates mobx observable fot path", () => {
    const store = new DataStore<{
      a: {
        b: number;
      };
    }>();

    const observable = dataStoreObservable(store, ["a", "b"]);

    expect(observable()).toBe(null);

    const mockFn = vi.fn<[DataValue | null], undefined>();
    const disposer = reaction(
      () => observable(),
      (value) => mockFn(value)
    );

    store.set(["a", "b"] as const, 1);

    expect(observable()).toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(1);

    disposer();

    store.set(["a", "b"] as const, 2);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
