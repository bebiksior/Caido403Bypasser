import { CaidoBackendSDK } from "@/types";

export class ScanError extends Error {
  constructor(
    message: string,
    public code: ScanErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ScanError';
  }
}

export enum ScanErrorCode {
  SCAN_NOT_FOUND = 'SCAN_NOT_FOUND',
  SCAN_TIMEOUT = 'SCAN_TIMEOUT',
  SCAN_WORKER_ERROR = 'SCAN_WORKER_ERROR',
  SCAN_STATE_UPDATE_ERROR = 'SCAN_STATE_UPDATE_ERROR',
  TEMPLATE_RESULT_NOT_FOUND = 'TEMPLATE_RESULT_NOT_FOUND',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export function isScanError(error: unknown): error is ScanError {
  return error instanceof ScanError;
}

function create(
  code: ScanErrorCode,
  details?: unknown
): ScanError {
  const messages: Record<ScanErrorCode, string> = {
    [ScanErrorCode.SCAN_NOT_FOUND]: 'Scan not found',
    [ScanErrorCode.SCAN_TIMEOUT]: 'Scan timed out',
    [ScanErrorCode.SCAN_WORKER_ERROR]: 'Error running scan worker',
    [ScanErrorCode.SCAN_STATE_UPDATE_ERROR]: 'Error updating scan state',
    [ScanErrorCode.TEMPLATE_RESULT_NOT_FOUND]: 'Template result not found',
    [ScanErrorCode.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please check the Caido logs for more details.',
  };

  return new ScanError(messages[code], code, details);
}

function notifyClient(sdk: CaidoBackendSDK, scanID: number, message: string) {
  sdk.api.send("scans:error", scanID, message);
}

export function createScanError(
  sdk: CaidoBackendSDK,
  scanID: number,
  code: ScanErrorCode,
  details?: unknown
): ScanError {
  const error = create(code, details);

  let message = error.message;
  if (error.details) {
    message += `\n${error.details}`;
  }

  notifyClient(sdk, scanID, message);
  return error;
}
