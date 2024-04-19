type DataObject = {
  readonly [key: string]: DataValue;
};
type DataLeaf = boolean | number | string | Uint8Array;
type DataValue = DataObject | DataLeaf;

type MutableDataObject = {
  [key: string]: DataValue;
};

function isObject(value: DataValue): value is DataObject {
  return typeof value === "object" && value.constructor === Object;
}

// Firebase Realtime Database-like API to store and sync document data
export class DataStore {
  constructor() {}

  set(path: readonly string[], value: DataValue | null) {
    if (value === null) {
      this.delete(path);
      return;
    }
    if (path.length === 0) {
      if (!isObject(value)) {
        throw new Error("Root value must be an object");
      }
      this.data = value;
      this.notifyChange(path);
      return;
    }

    let data = this.data as MutableDataObject;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!data[key] || !isObject(data[key])) {
        (data[key] as MutableDataObject) = {};
      }
      data = data[key] as MutableDataObject;
    }
    data[path[path.length - 1]] = value;

    this.notifyChange(path);
  }

  delete(path: readonly string[]) {
    let data = this.data as MutableDataObject;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!data[key] || !isObject(data[key])) {
        return;
      }
      data = data[key] as MutableDataObject;
    }
    delete data[path[path.length - 1]];

    this.notifyChange(path);
  }

  get(path: readonly string[]): DataValue | null {
    if (path.length === 0) return this.data;

    let data = this.data;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!data[key] || !isObject(data[key])) {
        return null;
      }
      data = data[key] as DataObject;
    }
    return data[path[path.length - 1]] ?? null;
  }

  private notifyChange(path: readonly string[]) {
    for (const listener of this.listeners) {
      const listenerPath = listener.path;
      if (listenerPath.length <= path.length) {
        let match = true;
        for (let i = 0; i < listenerPath.length; i++) {
          if (listenerPath[i] !== path[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          listener.callback(this.get(listenerPath));
        }
      }
    }
  }

  data: DataObject = {};

  private listeners = new Set<{
    path: readonly string[];
    callback: (data: DataValue | null) => void;
  }>();

  onChange(
    path: readonly string[],
    callback: (data: DataValue | null) => void
  ): () => void {
    const listener = { path, callback };

    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
