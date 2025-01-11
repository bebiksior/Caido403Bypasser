import { SDK } from "caido:plugin";
import {
  type Result,
  type Scan,
  type ScanTarget,
  type TemplateResult,
} from "shared";
import { ScanStore } from "../stores/scans";
import { SettingsStore } from "../stores/settings";
import { runScanWorker } from "../services/scanner";
import { CaidoBackendSDK } from "@/types";
import { Logger } from "../utils/logger";
import { ScanError, ScanErrorCode, createScanError } from "../errors/ScanError";

const logger = (sdk: SDK) => new Logger(sdk, 'ScanAPI');

export function getTemplateResults(
  sdk: SDK,
  scanID: number
): Result<TemplateResult[]> {
  const log = logger(sdk);
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) {
    const error = createScanError(sdk, scanID, ScanErrorCode.SCAN_NOT_FOUND);
    log.error(error);
    return { kind: "Error", error: error.message };
  }
  return { kind: "Success", value: scan.Results || [] };
}

export const getTemplateResult = (
  sdk: SDK,
  scanID: number,
  templateResultID: number
): Result<TemplateResult> => {
  const log = logger(sdk);
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) {
    const error = createScanError(sdk, scanID, ScanErrorCode.SCAN_NOT_FOUND);
    log.error(error);
    return { kind: "Error", error: error.message };
  }

  const templateResult = scan.Results.find(
    (result) => result.ID === templateResultID
  );

  if (!templateResult) {
    const error = createScanError(sdk, scanID, ScanErrorCode.TEMPLATE_RESULT_NOT_FOUND);
    log.error(error);
    return { kind: "Error", error: error.message };
  }

  return { kind: "Success", value: templateResult };
};

export const getScans = (sdk: SDK): Result<Scan[]> => {
  const scanStore = ScanStore.get();
  return { kind: "Success", value: scanStore.getScans() };
};

export const getScan = (
  sdk: SDK,
  scanID: number
): Result<Omit<Scan, "Results">> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (scan) return { kind: "Success", value: scan };
  return { kind: "Error", error: "Scan not found" };
};

const getHighestId = (): number => {
  const scanStore = ScanStore.get();
  const scans = scanStore.getScans();

  return scans.reduce((maxId, scan) => Math.max(maxId, scan.ID), 0);
};

export const addScan = async (
  sdk: CaidoBackendSDK,
  target: ScanTarget
): Promise<Result<Scan>> => {
  const scanStore = ScanStore.get();
  const nextID = getHighestId() + 1;

  const scan: Scan = {
    ID: nextID,
    State: "Running",
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

  if (scan) return { kind: "Success", value: scan };
  return { kind: "Error", error: "Scan not found" };
};

export const reRunScan = async (
  sdk: SDK,
  scanID: number
): Promise<Result<Scan>> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) return { kind: "Error", error: "Scan not found" };

  const newScan = await addScan(sdk, scan.Target);
  if (newScan.kind === "Error") {
    return newScan;
  }

  return await runScan(sdk, newScan.value.ID);
};

export const clearScans = (sdk: CaidoBackendSDK): Result<void> => {
  const scanStore = ScanStore.get();
  const scans = scanStore.getScans();
  scans.forEach((scan) => {
    if (scan.State === "Running") {
      cancelScan(sdk, scan.ID);
    }
  });

  scanStore.clearScans();
  sdk.api.send("scans:cleared");
  return { kind: "Success", value: undefined };
};

export const runScan = async (
  sdk: CaidoBackendSDK,
  scanID: number
): Promise<Result<Scan>> => {
  const log = logger(sdk);

  try {
    const scanStore = ScanStore.get();
    const scan = scanStore.getScan(scanID);

    if (!scan) {
      throw createScanError(sdk, scanID, ScanErrorCode.SCAN_NOT_FOUND);
    }

    const settingsStore = SettingsStore.get();
    const settings = settingsStore.getSettings();

    const updateScanState = (state: Scan['State']) => {
      try {
        scanStore.updateScan(scan.ID, { State: state });
        sdk.api.send("scans:updated", scan.ID, { State: state });
      } catch (error) {
        throw createScanError(sdk, scanID, ScanErrorCode.SCAN_STATE_UPDATE_ERROR, { state, error });
      }
    };

    updateScanState('Running');

    let timeout = setTimeout(() => {
      log.error(
        createScanError(sdk, scanID, ScanErrorCode.SCAN_TIMEOUT, {
          scanId: scan.ID,
          timeout: settings.scanTimeout
        })
      );
      updateScanState('Timed Out');
    }, settings.scanTimeout);

    try {
      runScanWorker(sdk, scan);
    } catch (error) {
      throw createScanError(sdk, scanID, ScanErrorCode.SCAN_WORKER_ERROR, error);
    } finally {
      const finishedAt = new Date();
      scanStore.updateScan(scan.ID, { finishedAt });
      sdk.api.send("scans:updated", scan.ID, { finishedAt });
      clearTimeout(timeout);
    }

    return { kind: "Success", value: scan };
  } catch (error) {
    log.error(error);

    if (error instanceof ScanError) {
      return { kind: "Error", error: error.message };
    }

    const unexpectedError = createScanError(sdk, scanID, ScanErrorCode.UNEXPECTED_ERROR, error);
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

  if (scan.State === "Running") {
    const updatedScan = scanStore.updateScan(id, { State: "Cancelled" });
    if (!updatedScan) {
      return { kind: "Error", error: "Scan not found" };
    }

    sdk.api.send("scans:updated", id, { State: "Cancelled" });
    return { kind: "Success", value: updatedScan };
  }

  return { kind: "Success", value: scan };
};
