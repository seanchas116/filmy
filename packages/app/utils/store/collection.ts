import { observable } from "mobx";

export class Collection<T> {
  constructor() {}

  readonly data = observable.map<string, T>([], { deep: false });
}
