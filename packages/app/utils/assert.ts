export function assertNonNull<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error(`Unexpected null or undefined`);
  }
  return value;
}
