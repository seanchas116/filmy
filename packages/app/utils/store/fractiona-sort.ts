import { Collection } from "@/utils/store/collection";
import { createAtom } from "mobx";

export interface FractionalSortResult {
  items: string[];
  indices: Map<string, number>;
}

export class FractionalSort<
  TData extends {
    order: number;
  }
> {
  constructor(collection: Collection<TData>) {
    this.collection = collection;
  }

  readonly collection: Collection<TData>;

  readonly items = new Set<string>();
  private result: FractionalSortResult | undefined;
  readonly atom = createAtom("FractionalSort");

  add(id: string) {
    this.items.add(id);
    this.result = undefined;
    this.atom.reportChanged();
  }

  delete(id: string) {
    this.items.delete(id);
    this.result = undefined;
    this.atom.reportChanged();
  }

  get(): FractionalSortResult {
    this.atom.reportObserved();

    if (!this.result) {
      const children = [...this.items];

      children.sort((a, b) => {
        const aData = this.collection.data.get(a);
        const bData = this.collection.data.get(b);
        const aOrder = aData?.order ?? 0;
        const bOrder = bData?.order ?? 0;
        return aOrder - bOrder;
      });

      this.result = {
        items: children,
        indices: new Map(children.map((id, index) => [id, index])),
      };
    }
    return this.result;
  }
}
