import { SettingsStore } from "../stores/settings";
import { TemplateStore } from "../stores/templates";
import { runScript, Scan, TemplateResult } from "shared";
import { RequestResponse, RequestSpecRaw } from "caido:utils";
import { SDK } from "caido:plugin";
import { ScanStore } from "@/stores/scans";
import { CaidoBackendSDK } from "@/types";

const BaseTemplateResult: TemplateResult = {
  ID: 0,
  TemplateID: "",
  SentRawRequest: "",
  Response: {
    StatusCode: 0,
    RawResponse: "",
    ContentLength: 0,
  },
  State: "Running",
};

const isCancelled = (scan: Scan) =>
  scan.State === "Cancelled" || scan.State === "Timed Out";

export const runScanWorker = async (
  sdk: CaidoBackendSDK,
  scan: Scan
): Promise<void> => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();

  const templateManager = TemplateStore.get();
  const templates = templateManager.getTemplates();

  const scanStore = ScanStore.get();

  let index = 0;
  for (const template of templates) {
    if (isCancelled(scan)) break;
    if (!template.enabled) continue;

    let baseRequest = scan.Target.RawRequest;
    const result = runScript(baseRequest, template.modificationScript);

    if (!result.success) {
      sdk.console.log(`Error running script: ${result.error}`);

      const templateResult: TemplateResult = {
        ...BaseTemplateResult,
        ID: index,
        TemplateID: template.id,
        SentRawRequest:
          "Template script failed to execute. Error:\n" + result.error,
        State: "Failed",
      };

      index++;
      scanStore.addTemplateResult(scan.ID, templateResult);
      sdk.api.send("templateResults:created", scan.ID, templateResult);

      continue;
    }

    for (const modifiedRequest of result.requests) {
      if (isCancelled(scan)) break;

      const templateResult: TemplateResult = {
        ...BaseTemplateResult,
        ID: index,
        TemplateID: template.id,
        State: "Running",
        SentRawRequest: modifiedRequest,
      };

      try {
        index++;

        scanStore.addTemplateResult(scan.ID, templateResult);
        sdk.api.send("templateResults:created", scan.ID, templateResult);

        const spec = new RequestSpecRaw(scan.Target.URL);
        spec.setRaw(modifiedRequest);

        const { response } = await sdk.requests.send(spec);
        const body = response.getRaw().toText() || "";

        const updateFields: Partial<TemplateResult> = {
          State: "Success",
          Response: {
            StatusCode: response.getCode(),
            RawResponse: body,
            ContentLength: body.length,
          },
        };

        scanStore.updateTemplateResult(
          scan.ID,
          templateResult.ID,
          updateFields
        );

        sdk.api.send(
          "templateResults:updated",
          scan.ID,
          templateResult.ID,
          updateFields
        );

        if (settings.templatesDelay > 0)
          await new Promise((resolve) =>
            setTimeout(resolve, settings.templatesDelay)
          );
      } catch (error) {
        sdk.console.log(`Error processing template ${template.id}: ${error}`);

        const updateFields: Partial<TemplateResult> = {
          State: "Failed",
          Response: {
            StatusCode: 0,
            RawResponse: `Error processing template: ${error}`,
            ContentLength: 0,
          },
        };

        scanStore.updateTemplateResult(
          scan.ID,
          templateResult.ID,
          updateFields
        );
        sdk.api.send(
          "templateResults:updated",
          scan.ID,
          templateResult.ID,
          updateFields
        );
      }
    }
  }

  if (isCancelled(scan)) {
    const fieldsUpdate: Partial<Scan> = {
      State: "Cancelled",
      finishedAt: new Date(),
    };
    scanStore.updateScan(scan.ID, fieldsUpdate);
    sdk.api.send("scans:updated", scan.ID, fieldsUpdate);
    return;
  }

  const fieldsUpdate: Partial<Scan> = {
    State: "Completed",
    finishedAt: scan.finishedAt,
  };

  scanStore.updateScan(scan.ID, fieldsUpdate);
  sdk.api.send("scans:updated", scan.ID, fieldsUpdate);
};

export const sendRequest = async (
  rawRequest: string,
  url: string,
  sdk: SDK
): Promise<RequestResponse> => {
  const spec = new RequestSpecRaw(url);
  spec.setRaw(rawRequest);
  return await sdk.requests.send(spec);
};
