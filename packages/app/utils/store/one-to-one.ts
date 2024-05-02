import { IMapDidChange } from "mobx";
import { Store } from "./store";

export class OneToOne<TData> {
  constructor(
    store: Store<TData>,
    getRef: (value: TData) => string | undefined
  ) {
    this.getRef = getRef;
    store.data.observe_(this.onChange.bind(this));
  }

  private getRef: (value: TData) => string | undefined;
  private refToID = new Map<string, string>();

  get(ref: string): string | undefined {
    return this.refToID.get(ref);
  }

  private onChange(change: IMapDidChange<string, TData>) {
    const oldValue = "oldValue" in change ? change.oldValue : undefined;
    const newValue = "newValue" in change ? change.newValue : undefined;

    const oldRef = oldValue ? this.getRef(oldValue) : undefined;
    const newRef = newValue ? this.getRef(newValue) : undefined;

    if (oldRef === newRef) {
      return;
    }

    if (oldRef) {
      this.refToID.delete(oldRef);
    }

    if (newRef) {
      this.refToID.set(newRef, change.name);
    }
  }
}
