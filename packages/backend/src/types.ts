import { DefineEvents, SDK } from "caido:plugin";
import { Scan, Template, TemplateResult } from "shared";
import { ScanError } from "./errors/ScanError";

export type BackendEvents = DefineEvents<{
  // Templates
  "templates:created": (template: Template, oldTemplateID?: string) => void;
  "templates:deleted": (templateID: string) => void;
  "templates:updated": (
    templateID: string,
    template: Partial<Template>
  ) => void;
  "templates:cleared": () => void;

  // Template Results
  "templateResults:created": (
    scanID: number,
    templateResult: TemplateResult
  ) => void;
  "templateResults:updated": (
    scanID: number,
    templateResultID: number,
    templateResult: Partial<TemplateResult>
  ) => void;

  // Scans
  "scans:created": (scan: Scan) => void;
  "scans:updated": (scanID: number, scan: Partial<Scan>) => void;
  "scans:deleted": (scanID: number) => void;
  "scans:cleared": () => void;
  "scans:error": (scanID: number, errorMessage: string) => void;
}>;

export type CaidoBackendSDK = SDK<never, BackendEvents>;
