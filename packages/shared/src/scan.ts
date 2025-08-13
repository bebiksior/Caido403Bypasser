export type ScanStatus = "Running" | "Completed" | "Failed" | "Timed Out" | "Cancelled";
export type Scan = {
  ID: number;
  Status: ScanStatus;
  Target: ScanTarget;
  startedAt?: Date;
  finishedAt?: Date;
  Results: TemplateResult[];
};

export type ScanTarget = {
  URL: string;
  Host: string;
  Port: number;
  IsTls: boolean;
  RawRequest: string;
};

export type TemplateResultStatus = "Running" | "Success" | "Failed";
export type TemplateResult = {
  ID: number;
  TemplateID: string;
  SentRawRequest: string;
  Response: Response;
  Status: TemplateResultStatus;
};

export type Response = {
  StatusCode: number;
  RawResponse: string;
  ContentLength: number;
  Time: number;
};
