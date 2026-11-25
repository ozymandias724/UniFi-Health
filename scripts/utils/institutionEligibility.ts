export const EXCLUDED_PARENT_CHILD_FLAGS: readonly number[] = [2, 3, 4, 5, 6];

export function hasExcludedReportingFlag(value: unknown): boolean {
  return (
    typeof value === "number" && EXCLUDED_PARENT_CHILD_FLAGS.includes(value)
  );
}
