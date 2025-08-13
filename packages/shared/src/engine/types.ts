export type Helper = {
  setLine: (
    input: string,
    lineNumber: number,
    updateFn: (line: string | undefined) => string,
  ) => string;
  setPath: (
    input: string,
    update: string | ((path: string) => string),
  ) => string;
  setQuery: (
    input: string,
    update: string | ((query: string) => string),
  ) => string;
  setMethod: (
    input: string,
    update: string | ((method: string) => string),
  ) => string;
  setBody: (
    input: string,
    update: string | ((body: string) => string),
  ) => string;
  addQueryParameter: (input: string, param: string) => string;
  addHeader: (input: string, header: string) => string;
  removeHeader: (input: string, header: string) => string;
  getMethod: (input: string) => string;
  getPath: (input: string) => string;
  getQuery: (input: string) => string;
  getBody: (input: string) => string;
  hasHeader: (input: string, header: string) => boolean;
};

export type TemplateOutput =
  | {
      success: true;
      requests: string[];
    }
  | {
      success: false;
      error: unknown;
    };
