import { SDK, DefineAPI } from "caido:plugin";
import {
  addScan,
  cancelScan,
  clearScans,
  deleteScan,
  getScan,
  getScans,
  getTemplateResult,
  getTemplateResults,
  reRunScan,
  runScan,
  updateScan,
} from "./api/scan";
import {
  getSettings,
  loadSettingsFromFile,
  updateSettings,
} from "./api/settings";
import {
  exportTemplate,
  getRawTemplate,
  getTemplates,
  getTemplate,
  importTemplate,
  loadTemplates,
  removeTemplate,
  saveTemplate,
  writeTemplates,
  resetTemplates,
  clearTemplates,
} from "./api/templates";
import { ensureDir } from "./utils/utils";
import defaultTemplates from "@/defaultTemplates/defaultTemplates";
import { TemplateStore } from "@/stores/templates";
import { CaidoBackendSDK } from "./types";

export type { BackendEvents } from "./types";

export type API = DefineAPI<{
  // Templates
  getTemplates: typeof getTemplates;
  getTemplate: typeof getTemplate;
  getRawTemplate: typeof getRawTemplate;
  saveTemplate: typeof saveTemplate;
  removeTemplate: typeof removeTemplate;
  exportTemplate: typeof exportTemplate;
  importTemplate: typeof importTemplate;
  resetTemplates: typeof resetTemplates;
  clearTemplates: typeof clearTemplates;

  // Scans
  getScans: typeof getScans;
  getScan: typeof getScan;
  addScan: typeof addScan;
  deleteScan: typeof deleteScan;
  updateScan: typeof updateScan;
  cancelScan: typeof cancelScan;
  runScan: typeof runScan;
  reRunScan: typeof reRunScan;
  clearScans: typeof clearScans;
  getTemplateResults: typeof getTemplateResults;
  getTemplateResult: typeof getTemplateResult;

  // Settings
  getSettings: typeof getSettings;
  updateSettings: typeof updateSettings;
}>;

export async function init(sdk: SDK<API>) {
  const firstTime = await ensureDir(sdk);

  if (firstTime) {
    sdk.console.log("First time setup, adding default templates");

    const templateStore = TemplateStore.get();
    templateStore.addTemplates(defaultTemplates);
    await writeTemplates(sdk, defaultTemplates);
  }

  await loadTemplates(sdk);
  await loadSettingsFromFile(sdk);

  // Templates
  sdk.api.register("getTemplates", getTemplates);
  sdk.api.register("getTemplate", getTemplate);
  sdk.api.register("getRawTemplate", getRawTemplate);
  sdk.api.register("saveTemplate", saveTemplate);
  sdk.api.register("removeTemplate", removeTemplate);
  sdk.api.register("exportTemplate", exportTemplate);
  sdk.api.register("importTemplate", importTemplate);
  sdk.api.register("resetTemplates", resetTemplates);
  sdk.api.register("clearTemplates", clearTemplates);

  // Scans
  sdk.api.register("getScans", getScans);
  sdk.api.register("getScan", getScan);
  sdk.api.register("addScan", addScan);
  sdk.api.register("deleteScan", deleteScan);
  sdk.api.register("updateScan", updateScan);
  sdk.api.register("runScan", runScan);
  sdk.api.register("reRunScan", reRunScan);
  sdk.api.register("getTemplateResults", getTemplateResults);
  sdk.api.register("getTemplateResult", getTemplateResult);
  sdk.api.register("clearScans", clearScans);
  sdk.api.register("cancelScan", cancelScan);

  // Settings
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("updateSettings", updateSettings);

  setTimeout(() => {
    checkUpdates(sdk);
  }, 2000);
}

async function checkUpdates(sdk: CaidoBackendSDK) {
  try {
    const isOutdated = await sdk.meta.updateAvailable();
    if (isOutdated) {
      sdk.api.send("plugin:outdated");
    }
  } catch {
    sdk.console.log("Can't check for updates: Caido Cloud is offline.");
  }
}
