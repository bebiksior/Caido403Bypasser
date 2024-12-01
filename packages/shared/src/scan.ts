export type Scan = {
  ID: number;
  State: "Running" | "Completed" | "Failed" | "Timed Out" | "Cancelled";
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

export type TemplateResult = {
  ID: number;
  TemplateID: string;
  SentRawRequest: string;
  Response: Response;
  State: "Running" | "Success" | "Failed";
};

export type Response = {
  StatusCode: number;
  RawResponse: string;
  ContentLength: number;
  Time: number;
};
