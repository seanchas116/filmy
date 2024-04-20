import { DataStore, TypeForPath } from "./data-store";
import { createAtom } from "mobx";

export function dataStoreObservable<TStoredData, TPath extends string>(
  dataStore: DataStore<TStoredData>,
  path: TPath
): () => TypeForPath<TStoredData, TPath> | null {
  let unsubscribe: () => void | undefined;

  const atom = createAtom(
    "DataStoreObservable:" + path,
    () => {
      unsubscribe = dataStore.onChange(path, () => {
        atom.reportChanged();
      });
    },
    () => {
      unsubscribe?.();
    }
  );

  return () => {
    atom.reportObserved();
    return dataStore.get(path);
  };
}
