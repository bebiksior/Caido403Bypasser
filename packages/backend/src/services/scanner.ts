import { type SDK } from "caido:plugin";
import { type RequestResponse, RequestSpecRaw } from "caido:utils";
import { runScript, type Scan, type TemplateResult } from "shared";

import { ScanStore } from "../stores/scans";
import { SettingsStore } from "../stores/settings";
import { TemplateStore } from "../stores/templates";
import { type CaidoBackendSDK } from "../types";

const BaseTemplateResult: Omit<TemplateResult, "ID"> = {
  TemplateID: "",
  SentRawRequest: "",
  Response: {
    StatusCode: 0,
    RawResponse: "",
    ContentLength: 0,
    Time: 0,
  },
  Status: "Running",
};

function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

const isCancelled = (scan: Scan) =>
  scan.Status === "Cancelled" || scan.Status === "Timed Out";

function getNextTemplateResultID(scanStore: ScanStore, scanID: number): number {
  const scan = scanStore.getScan(scanID);
  if (!scan) {return 1;}

  const highestID = scan.Results.reduce(
    (max, result) => Math.max(max, result.ID),
    0,
  );
  return highestID + 1;
}

export const runScanWorker = async (
  sdk: CaidoBackendSDK,
  scan: Scan,
): Promise<void> => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();

  const templateManager = TemplateStore.get();
  const templates = templateManager.getTemplates();

  const scanStore = ScanStore.get();

  for (const template of templates) {
    if (isCancelled(scan)) {break;}
    if (!template.enabled) {continue;}

    const baseRequest = scan.Target.RawRequest;
    const result = runScript(baseRequest, template.modificationScript);

    if (!result.success) {
      sdk.console.log(`Error running script: ${result.error}`);

      const templateResult: TemplateResult = {
        ...BaseTemplateResult,
        ID: getNextTemplateResultID(scanStore, scan.ID),
        TemplateID: template.id,
        SentRawRequest:
          "Template script failed to execute. Error:\n" + String(result.error),
        Status: "Failed",
      };

      scanStore.addTemplateResult(scan.ID, templateResult);
      sdk.api.send("templateResults:created", scan.ID, templateResult);

      continue;
    }

    for (const modifiedRequest of result.requests) {
      if (isCancelled(scan)) {break;}

      const templateResultID = getNextTemplateResultID(scanStore, scan.ID);
      const templateResult: TemplateResult = {
        ...BaseTemplateResult,
        ID: templateResultID,
        TemplateID: template.id,
        Status: "Running",
        SentRawRequest: modifiedRequest,
      };

      try {
        scanStore.addTemplateResult(scan.ID, templateResult);
        sdk.api.send("templateResults:created", scan.ID, templateResult);

        const spec = new RequestSpecRaw(scan.Target.URL);
        spec.setRaw(stringToUint8Array(modifiedRequest));

        const { response } = await sdk.requests.send(spec);
        const body = response.getRaw().toText() ?? "";

        const updateFields: Partial<TemplateResult> = {
          Status: "Success",
          Response: {
            StatusCode: response.getCode(),
            RawResponse: body,
            ContentLength: body.length,
            Time: response.getRoundtripTime(),
          },
        };

        scanStore.updateTemplateResult(scan.ID, templateResultID, updateFields);

        sdk.api.send(
          "templateResults:updated",
          scan.ID,
          templateResultID,
          updateFields,
        );

        if (settings.templatesDelay > 0)
          {await new Promise((resolve) =>
            setTimeout(resolve, settings.templatesDelay),
          );}
      } catch (error) {
        sdk.console.log(`Error processing template ${template.id}: ${error}`);

        const updateFields: Partial<TemplateResult> = {
          Status: "Failed",
          Response: {
            StatusCode: 0,
            RawResponse: `Error processing template: ${error}`,
            ContentLength: 0,
            Time: 0,
          },
        };

        scanStore.updateTemplateResult(scan.ID, templateResultID, updateFields);
        sdk.api.send(
          "templateResults:updated",
          scan.ID,
          templateResultID,
          updateFields,
        );
      }
    }
  }

  if (isCancelled(scan)) {
    const fieldsUpdate: Partial<Scan> = {
      Status: "Cancelled",
      finishedAt: new Date(),
    };
    scanStore.updateScan(scan.ID, fieldsUpdate);
    sdk.api.send("scans:updated", scan.ID, fieldsUpdate);
    return;
  }

  const fieldsUpdate: Partial<Scan> = {
    Status: "Completed",
    finishedAt: scan.finishedAt,
  };

  scanStore.updateScan(scan.ID, fieldsUpdate);
  sdk.api.send("scans:updated", scan.ID, fieldsUpdate);
};

export const sendRequest = async (
  rawRequest: string,
  url: string,
  sdk: SDK,
): Promise<RequestResponse> => {
  const spec = new RequestSpecRaw(url);
  spec.setRaw(rawRequest);
  return await sdk.requests.send(spec);
};
