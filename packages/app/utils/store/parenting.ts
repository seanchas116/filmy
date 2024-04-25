import { IMapDidChange } from "mobx";
import { Collection } from "./collection";
import { FractionalSort, FractionalSortResult } from "./fractiona-sort";
import { getOrAdd } from "../get-or-add";

export class Parenting<
  TData extends {
    parent?: string;
    order: number;
  }
> {
  constructor(collection: Collection<TData>) {
    this.collection = collection;
    collection.data.observe_(this.onChange.bind(this));
    for (const [name, data] of collection.data) {
      if (data.parent) {
        this.getChildrenSort(data.parent).add(name);
      }
    }
  }

  private collection: Collection<TData>;
  private childrenMap = new Map<string, FractionalSort<TData>>();

  private onChange(change: IMapDidChange<string, TData>) {
    const oldValue = "oldValue" in change ? change.oldValue : undefined;
    const newValue = "newValue" in change ? change.newValue : undefined;

    // position not changed
    if (
      oldValue?.parent === newValue?.parent &&
      oldValue?.order === newValue?.order
    ) {
      return;
    }

    // remove from old parent
    if (oldValue?.parent) {
      this.getChildrenSort(oldValue.parent).delete(change.name);
    }

    // add to new parent
    if (newValue?.parent) {
      this.getChildrenSort(newValue.parent).add(change.name);
    }
  }

  private getChildrenSort(parent: string): FractionalSort<TData> {
    return getOrAdd(
      this.childrenMap,
      parent,
      () => new FractionalSort(this.collection)
    );
  }

  getChildren(parent: string): FractionalSortResult {
    return this.getChildrenSort(parent).get();
  }
}
