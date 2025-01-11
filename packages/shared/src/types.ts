interface ErrorResult {
  kind: "Error";
  error: string;
  code?: string;
  details?: unknown;
}
