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
    if (value === null) {
      this.delete(slashPath);
      return;
    }

    const path = slashPath.split("/");
    if (path.length === 0) {
      throw new Error("Use root setter to set root value");
    }

    let data = this.data as Record<string, unknown>;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!data[key] || !isPlainObject(data[key])) {
        data[key] = {};
      }
      data = data[key] as Record<string, unknown>;
    }
    data[path[path.length - 1]] = value;

    this.notifyChange(path);
  }

  private delete(slashPath: string) {
    const path = slashPath.split("/");

    let data = this.data as Record<string, unknown>;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!data[key] || !isPlainObject(data[key])) {
        return;
      }
      data = data[key] as Record<string, unknown>;
    }
    delete data[path[path.length - 1]];

    this.notifyChange(path);
  }

  get root() {
    return this.data;
  }

  set root(value: TRootData) {
    this.data = value;
    this.notifyChange([]);
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
          listener.callback(this.get(listenerPath.join("/")));
        }
      }
    }
  }

  private data = {} as TRootData;

  private listeners = new Set<{
    path: readonly string[];
    callback: (data: unknown) => void;
  }>();

  onChange<TPath extends string>(
    slashPath: TPath,
    callback: (data: TypeForPath<TRootData, TPath> | null) => void
  ): () => void {
    const listener = {
      path: slashPath.split("/"),
      callback: callback as (data: unknown) => void,
    };

    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
