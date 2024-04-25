import { describe, expect, it } from "vitest";
import { Parenting } from "./parenting";
import { Collection } from "./collection";

describe(Parenting, () => {
  it("manages parent/child relationships", () => {
    const collection = new Collection<{
      parent?: string;
      order: number;
      name: string;
    }>();
    const parenting = new Parenting(collection);

    // generate example data

    const a = { parent: undefined, order: 0, name: "a" };
    const b = { parent: "a", order: 1, name: "b" };
    const c = { parent: "a", order: 2, name: "c" };

    collection.data.set("a", a);
    collection.data.set("b", b);
    collection.data.set("c", c);

    expect(parenting.getChildren("a").items).toEqual(["b", "c"]);

    collection.data.delete("b");

    expect(parenting.getChildren("a").items).toEqual(["c"]);
  });

  it("loads initial data", () => {
    const collection = new Collection<{
      parent?: string;
      order: number;
      name: string;
    }>();

    const a = { parent: undefined, order: 0, name: "a" };
    const b = { parent: "a", order: 1, name: "b" };
    collection.data.set("a", a);
    collection.data.set("b", b);

    const parenting = new Parenting(collection);

    // generate example data

    const c = { parent: "a", order: 2, name: "c" };
    collection.data.set("c", c);

    expect(parenting.getChildren("a").items).toEqual(["b", "c"]);
    expect(parenting.getChildren("a").indices).toEqual(
      new Map([
        ["b", 0],
        ["c", 1],
      ])
    );
  });
});
