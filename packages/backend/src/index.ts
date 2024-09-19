import { SDK, DefineAPI } from "caido:plugin";
import {
  addScan,
  cancelScan,
  clearScans,
  deleteScan,
  getScan,
  getScans,
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
  importTemplate,
  loadTemplates,
  removeTemplate,
  saveTemplate,
  writeTemplates,
} from "./api/templates";
import { ensureDir } from "./utils/utils";
import defaultTemplates from "@/defaultTemplates/defaultTemplates";
import { TemplateStore } from "@/stores/templates";

export type { BackendEvents } from "./types";

export type API = DefineAPI<{
  // Templates
  getTemplates: typeof getTemplates;
  getRawTemplate: typeof getRawTemplate;
  saveTemplate: typeof saveTemplate;
  removeTemplate: typeof removeTemplate;
  exportTemplate: typeof exportTemplate;
  importTemplate: typeof importTemplate;

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
  sdk.api.register("getRawTemplate", getRawTemplate);
  sdk.api.register("saveTemplate", saveTemplate);
  sdk.api.register("removeTemplate", removeTemplate);
  sdk.api.register("exportTemplate", exportTemplate);
  sdk.api.register("importTemplate", importTemplate);

  // Scans
  sdk.api.register("getScans", getScans);
  sdk.api.register("getScan", getScan);
  sdk.api.register("addScan", addScan);
  sdk.api.register("deleteScan", deleteScan);
  sdk.api.register("updateScan", updateScan);
  sdk.api.register("runScan", runScan);
  sdk.api.register("reRunScan", reRunScan);
  sdk.api.register("getTemplateResults", getTemplateResults);
  sdk.api.register("clearScans", clearScans);
  sdk.api.register("cancelScan", cancelScan); 

  // Settings
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("updateSettings", updateSettings);
}
