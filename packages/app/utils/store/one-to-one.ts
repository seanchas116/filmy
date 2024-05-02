import { IMapDidChange } from "mobx";
import { Store } from "./store";

export class OneToOne<TData> {
  constructor(
    store: Store<TData>,
    getValue: (row: TData) => string | undefined
  ) {
    this.getValue = getValue;
    store.data.observe_(this.onChange.bind(this));
  }

  private getValue: (row: TData) => string | undefined;
  private valueToKey = new Map<string, string>();

  get(value: string): string | undefined {
    return this.valueToKey.get(value);
  }

  private onChange(change: IMapDidChange<string, TData>) {
    const oldRow = "oldValue" in change ? change.oldValue : undefined;
    const newRow = "newValue" in change ? change.newValue : undefined;

    const oldValue = oldRow ? this.getValue(oldRow) : undefined;
    const newValue = newRow ? this.getValue(newRow) : undefined;

    if (oldValue === newValue) {
      return;
    }

    if (oldValue) {
      this.valueToKey.delete(oldValue);
    }

    if (newValue) {
      this.valueToKey.set(newValue, change.name);
    }
  }
}
