export function assertNonNull<T>(value: T | null | undefined): value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be defined, but received ${value}`);
  }
  return true;
}
