import { DataStore, DataValue } from "./data-store";
import { createAtom } from "mobx";

export function dataStoreObservable(
  dataStore: DataStore,
  path: readonly string[]
): () => DataValue | null {
  let unsubscribe: () => void | undefined;

  const atom = createAtom(
    "DataStoreObservable:" + path.join("/"),
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
