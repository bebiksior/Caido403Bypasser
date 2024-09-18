export type Result<T> =
  | { kind: "Error"; error: string }
  | { kind: "Success"; value: T };
