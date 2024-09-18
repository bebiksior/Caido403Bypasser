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

export function getTemplateResults(
  sdk: SDK,
  scanID: number
): Result<TemplateResult[]> {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  if (!scan) return { kind: "Error", error: "Scan not found" };
  return { kind: "Success", value: scan.Results || [] };
}

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

export const addScan = async (
  sdk: CaidoBackendSDK,
  target: ScanTarget
): Promise<Result<Scan>> => {
  const scanStore = ScanStore.get();
  const scans = scanStore.getScans();

  const scan: Scan = {
    ID: scans.length,
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
  scanStore.clearScans();
  sdk.api.send("scans:cleared");
  return { kind: "Success", value: undefined };
}

export const runScan = async (
  sdk: CaidoBackendSDK,
  scanID: number
): Promise<Result<Scan>> => {
  const scanStore = ScanStore.get();
  const scan = scanStore.getScan(scanID);

  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();

  if (!scan) return { kind: "Error", error: "Scan not found" };

  scanStore.updateScan(scan.ID, { State: "Running" });
  sdk.api.send("scans:updated", scan.ID, { State: "Running" });

  let timeout = setTimeout(() => {
    sdk.console.log(
      "Scan " + scan.ID + " timed out after " + settings.scanTimeout + "ms"
    );

    scanStore.updateScan(scan.ID, { State: "Timed Out" });
    sdk.api.send("scans:updated", scan.ID, { State: "Timed Out" });
  }, settings.scanTimeout);

  runScanWorker(sdk, scan)
    .catch((error) => {
      sdk.console.log(`Error running scan: ${error}`);

      scanStore.updateScan(scan.ID, { State: "Failed" });
      sdk.api.send("scans:updated", scan.ID, { State: "Failed" });
    })
    .finally(() => {
      const finishedAt = new Date();

      scanStore.updateScan(scan.ID, { finishedAt });
      sdk.api.send("scans:updated", scan.ID, { finishedAt });

      clearTimeout(timeout);
    });

  return { kind: "Success", value: scan };
};
