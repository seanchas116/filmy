import { cloneDeep } from "lodash-es";

export type TypeForPath<
  TData,
  TPath extends string
> = TPath extends `${infer Key}/${infer Rest}`
  ? Key extends keyof TData
    ? TypeForPath<NonNullable<TData[Key]>, Rest>
    : never
  : TPath extends keyof TData
  ? TData[TPath]
  : never;

function isPlainObject(value: unknown): boolean {
  return typeof value === "object" && !!value && value.constructor === Object;
}

// Firebase Realtime Database-like API to store and sync document data
export class DataStore<TRootData> {
  constructor() {}

  set<TPath extends string>(
    slashPath: TPath,
    value: TypeForPath<TRootData, TPath> | null
  ) {
    if (value == null) {
      this.delete(slashPath);
      return;
    }

    const path = slashPath.split("/");
    if (path.length === 0) {
      throw new Error("Use root setter to set root value");
    }

    this.notifyChange(slashPath, () => {
      let data = this.data as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!data[key] || !isPlainObject(data[key])) {
          data[key] = {};
        }
        data = data[key] as Record<string, unknown>;
      }

      data[path[path.length - 1]] = value;
    });
  }

  private delete(slashPath: string) {
    const path = slashPath.split("/");

    this.notifyChange(slashPath, () => {
      let data = this.data as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!data[key] || !isPlainObject(data[key])) {
          return;
        }
        data = data[key] as Record<string, unknown>;
      }

      delete data[path[path.length - 1]];
    });
  }

  get root() {
    return this.data;
  }

  set root(value: TRootData) {
    this.notifyChange("", () => {
      this.data = value;
    });
  }

  get<TPath extends string>(
    slashPath: TPath
  ): TypeForPath<TRootData, TPath> | null {
    const path = slashPath.split("/");
    if (path.length === 0) {
      throw new Error("Use root getter to get root value");
    }

    let data = this.data as Record<string, unknown>;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!data[key] || !isPlainObject(data[key])) {
        return null;
      }
      data = data[key] as Record<string, unknown>;
    }
    return (data[path[path.length - 1]] ?? null) as TypeForPath<
      TRootData,
      TPath
    > | null;
  }

  private notifyChange(path: string, doChange: () => void) {
    const targetUpdateListeners: {
      path: string;
      key: string;
      oldValue: unknown;
      listener: (key: string, newValue: unknown, oldValue: unknown) => void;
    }[] = [];

    const targetChangeListeners: {
      path: string;
      oldValue: unknown;
      listener: (newValue: unknown, oldValue: unknown) => void;
    }[] = [];

    const pathParts = path.split("/");
    const parentPath = pathParts.slice(0, pathParts.length - 1).join("/");

    // emit update events
    for (const listener of this.updateListeners) {
      if (
        listener.path === parentPath ||
        parentPath.startsWith(listener.path + "/")
      ) {
        // example:
        // listener.path = "a/b"
        // path = 'a/b/c/d'
        // parentPath = "a/b/c"
        // key = 'c
        const key = pathParts[listener.path.split("/").length];

        targetUpdateListeners.push({
          path: parentPath,
          key,
          oldValue: cloneDeep(this.get(`${listener.path}/${key}`)),
          listener: listener.callback,
        });
      }
    }

    // emit change events
    // TODO: determine call order
    for (const listener of this.changeListeners) {
      const listenerPath = listener.path;
      if (listenerPath === path || path.startsWith(listenerPath + "/")) {
        targetChangeListeners.push({
          path: listenerPath,
          oldValue: cloneDeep(this.get(listenerPath)),
          listener: listener.callback,
        });
      }
    }

    doChange();

    for (const { path, key, oldValue, listener } of targetUpdateListeners) {
      listener(key, this.get(`${path}/${key}`), oldValue);
    }
    for (const { path, oldValue, listener } of targetChangeListeners) {
      listener(this.get(path), oldValue);
    }
  }

  private data = {} as TRootData;

  private changeListeners = new Set<{
    path: string;
    callback: (newValue: unknown, oldValue: unknown) => void;
  }>();

  private updateListeners = new Set<{
    path: string;
    callback: (key: string, newValue: unknown, oldValue: unknown) => void;
  }>();

  onChange<TPath extends string>(
    slashPath: TPath,
    callback: (
      newValue: TypeForPath<TRootData, TPath> | null,
      oldValue: TypeForPath<TRootData, TPath> | null
    ) => void
  ): () => void {
    const listener = {
      path: slashPath,
      callback: callback as (data: unknown) => void,
    };

    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  onUpdate<TPath extends string>(
    slashPath: TPath,
    callback: (
      key: string,
      oldValue: TypeForPath<TRootData, `${TPath}/${string}`> | null,
      newValue: TypeForPath<TRootData, `${TPath}/${string}`> | null
    ) => void
  ): () => void {
    const listener = {
      path: slashPath,
      callback: callback as (
        key: string,
        oldValue: unknown,
        newValue: unknown
      ) => void,
    };

    this.updateListeners.add(listener);
    return () => {
      this.updateListeners.delete(listener);
    };
  }
}
