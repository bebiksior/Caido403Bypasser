import { type SDK } from "caido:plugin";
import {
  ScanStatus,
  type Result,
  type Scan,
  type ScanTarget,
  type TemplateResult,
} from "shared";

import { createScanError, ScanError, ScanErrorCode } from "../errors/ScanError";
import { runScanWorker } from "../services/scanner";
import { ScanStore } from "../stores/scans";
import { SettingsStore } from "../stores/settings";
import { type CaidoBackendSDK } from "../types";

export function getTemplateResults(
  sdk: SDK,
  scanID: number
): Result<TemplateResult[]> {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) {
    const error = createScanError(sdk, scanID, ScanErrorCode.SCAN_NOT_FOUND);
    console.error(error);
    return { kind: "Error", error: error.message };
  }
  return { kind: "Success", value: scan.Results };
}

export const getTemplateResult = (
  sdk: SDK,
  scanID: number,
  templateResultID: number
): Result<TemplateResult> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) {
    const error = createScanError(sdk, scanID, ScanErrorCode.SCAN_NOT_FOUND);
    console.error(error);
    return { kind: "Error", error: error.message };
  }

  const templateResult = scan.Results.find(
    (result) => result.ID === templateResultID
  );

  if (!templateResult) {
    const error = createScanError(
      sdk,
      scanID,
      ScanErrorCode.TEMPLATE_RESULT_NOT_FOUND
    );
    console.error(error);
    return { kind: "Error", error: error.message };
  }

  return { kind: "Success", value: templateResult };
};

export const getScans = (): Result<Scan[]> => {
  const scanStore = ScanStore.get();
  return { kind: "Success", value: scanStore.getScans() };
};

export const getScan = (
  _: SDK,
  scanID: number
): Result<Omit<Scan, "Results">> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (scan) {
    return { kind: "Success", value: scan };
  }
  return { kind: "Error", error: "Scan not found" };
};

const getNextId = (): number => {
  const scanStore = ScanStore.get();
  const scans = scanStore.getScans();

  return scans.reduce((maxId, scan) => Math.max(maxId, scan.ID), 0) + 1;
};

export const addScan = (
  sdk: CaidoBackendSDK,
  target: ScanTarget
): Result<Scan> => {
  const scanStore = ScanStore.get();
  const nextID = getNextId();

  const scan: Scan = {
    ID: nextID,
    Status: "Running",
    Target: target,
    startedAt: new Date(),
    Results: [],
  };

  scanStore.addScan(scan);
  sdk.api.send("scans:created", scan);
  return { kind: "Success", value: scan };
};

export const deleteScan = (sdk: CaidoBackendSDK, id: number): Result<void> => {
  const scanStore = ScanStore.get();
  cancelScan(sdk, id);
  scanStore.deleteScan(id);

  sdk.api.send("scans:deleted", id);
  return { kind: "Success", value: undefined };
};

export const updateScan = (
  sdk: CaidoBackendSDK,
  id: number,
  fields: Partial<Scan>
): Result<Scan> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.updateScan(id, fields);
  sdk.api.send("scans:updated", id, fields);

  if (scan) {
    return { kind: "Success", value: scan };
  }
  return { kind: "Error", error: "Scan not found" };
};

export const reRunScan = (sdk: SDK, scanID: number): Result<Scan> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) {
    return { kind: "Error", error: "Scan not found" };
  }

  const newScan = addScan(sdk, scan.Target);
  if (newScan.kind === "Error") {
    return newScan;
  }

  return runScan(sdk, newScan.value.ID);
};

export const clearScans = (sdk: CaidoBackendSDK): Result<void> => {
  const scanStore = ScanStore.get();
  const scans = scanStore.getScans();
  scans.forEach((scan) => {
    if (scan.Status === "Running") {
      cancelScan(sdk, scan.ID);
    }
  });

  scanStore.clearScans();
  sdk.api.send("scans:cleared");
  return { kind: "Success", value: undefined };
};

export const runScan = (sdk: CaidoBackendSDK, scanID: number): Result<Scan> => {
  try {
    const scanStore = ScanStore.get();
    const scan = scanStore.getScan(scanID);

    if (!scan) {
      throw createScanError(sdk, scanID, ScanErrorCode.SCAN_NOT_FOUND);
    }

    const settingsStore = SettingsStore.get();
    const settings = settingsStore.getSettings();

    const updateScanState = (status: ScanStatus) => {
      try {
        scanStore.updateScan(scan.ID, { Status: status });
        sdk.api.send("scans:updated", scan.ID, { State: status });
      } catch (error) {
        throw createScanError(
          sdk,
          scanID,
          ScanErrorCode.SCAN_STATE_UPDATE_ERROR,
          { state: status, error }
        );
      }
    };

    updateScanState("Running");

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          createScanError(sdk, scanID, ScanErrorCode.SCAN_TIMEOUT, {
            scanId: scan.ID,
            timeout: settings.scanTimeout,
          })
        );
      }, settings.scanTimeout);
    });

    try {
      Promise.race([runScanWorker(sdk, scan), timeoutPromise]).catch(
        (error) => {
          if (error.code === ScanErrorCode.SCAN_TIMEOUT) {
            console.error(error);
            updateScanState("Timed Out");
          } else {
            throw error;
          }
        }
      );
    } catch (error) {
      throw createScanError(
        sdk,
        scanID,
        ScanErrorCode.SCAN_WORKER_ERROR,
        error
      );
    } finally {
      const finishedAt = new Date();
      scanStore.updateScan(scan.ID, { finishedAt });
      sdk.api.send("scans:updated", scan.ID, { finishedAt });
    }

    return { kind: "Success", value: scan };
  } catch (error) {
    console.error(error);

    if (error instanceof ScanError) {
      return { kind: "Error", error: error.message };
    }

    const unexpectedError = createScanError(
      sdk,
      scanID,
      ScanErrorCode.UNEXPECTED_ERROR,
      error
    );
    return {
      kind: "Error",
      error: unexpectedError.message,
    };
  }
};

export const cancelScan = (sdk: CaidoBackendSDK, id: number): Result<Scan> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(id);

  if (!scan) {
    return { kind: "Error", error: "Scan not found" };
  }

  if (scan.Status === "Running") {
    const updatedScan = scanStore.updateScan(id, { Status: "Cancelled" });
    if (!updatedScan) {
      return { kind: "Error", error: "Scan not found" };
    }

    sdk.api.send("scans:updated", id, { State: "Cancelled" });
    return { kind: "Success", value: updatedScan };
  }

  return { kind: "Success", value: scan };
};
