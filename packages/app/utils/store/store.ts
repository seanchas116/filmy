import { observable } from "mobx";

export class Store<T> {
  constructor() {}

  readonly data = observable.map<string, T>([], { deep: false });
}
