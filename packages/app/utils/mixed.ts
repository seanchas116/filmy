import { isEqual } from "lodash-es";

export const MIXED = Symbol("mixed");

export function sameOrMixed<T>(
  values: readonly T[],
  {
    shallow,
  }: {
    shallow?: boolean;
  } = {}
): undefined | T | typeof MIXED {
  if (!values.length) {
    return undefined;
  }
  if (shallow) {
    if (values.some((v) => v !== values[0])) {
      return MIXED;
    }
  } else {
    if (values.some((v) => !isEqual(v, values[0]))) {
      return MIXED;
    }
  }
  return values[0];
}
