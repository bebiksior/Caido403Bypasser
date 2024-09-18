export interface Helper {
  setLine: (
    input: string,
    lineNumber: number,
    updateFn: (line: string | undefined) => string
  ) => string;
  setPath: (input: string, updateFn: (path: string) => string) => string;
  setQuery: (input: string, updateFn: (query: string) => string) => string;
  setMethod: (input: string, updateFn: (method: string) => string) => string;
  addQueryParameter: (input: string, param: string) => string;
  addHeader: (input: string, header: string) => string;
  removeHeader: (input: string, header: string) => string;
  setBody: (input: string, body: string) => string;
  getMethod: (input: string) => string;
  getPath: (input: string) => string;
  getQuery: (input: string) => string;
  hasHeader: (input: string, header: string) => boolean;
}

type TemplateOutput = {
  success: boolean;
  requests: string[];
  error?: any;
};

export const runScript = (
  initialInput: string,
  script: string
): TemplateOutput => {
  const helper: Helper = {
    setLine: (
      input: string,
      lineNumber: number,
      updateFn: (line: string | undefined) => string
    ) => {
      const lines = input.split("\n");
      lines[lineNumber] = updateFn(lines[lineNumber]);
      return lines.join("\n");
    },

    setPath: (input: string, updateFn: (path: string) => string) => {
      const lines = input.split("\n");
      const firstLine = lines[0];
      if (!firstLine) {
        throw new Error("No lines in input");
      }

      const [method, url, version] = firstLine.split(" ");
      if (!method || !url || !version) {
        throw new Error("Invalid first line");
      }

      const [path, query] = url.split("?", 2);
      if (!path) {
        throw new Error("Invalid URL");
      }

      const updatedPath = updateFn(path);

      lines[0] = query
        ? `${method} ${updatedPath}?${query} ${version}`
        : `${method} ${updatedPath} ${version}`;

      return lines.join("\n");
    },

    addQueryParameter: (input: string, param: string) => {
      const lines = input.split("\n");
      const firstLine = lines[0];
      if (!firstLine) {
        throw new Error("No lines in input");
      }

      const [method, url, version] = firstLine.split(" ");
      if (!method || !url || !version) {
        throw new Error("Invalid first line");
      }

      const [path, query] = url.split("?", 2);
      const updatedQuery = query ? `${query}&${param}` : param;

      lines[0] = updatedQuery
        ? `${method} ${path}?${updatedQuery} ${version}`
        : `${method} ${path} ${version}`;

      return lines.join("\n");
    },

    setQuery: (input: string, updateFn: (query: string) => string) => {
      const lines = input.split("\n");
      const firstLine = lines[0];
      if (!firstLine) {
        throw new Error("No lines in input");
      }

      const [method, url, version] = firstLine.split(" ");
      if (!method || !url || !version) {
        throw new Error("Invalid first line");
      }

      const [path, query] = url.split("?", 2);
      const updatedQuery = updateFn(query || "");

      lines[0] = updatedQuery
        ? `${method} ${path}?${updatedQuery} ${version}`
        : `${method} ${path} ${version}`;

      return lines.join("\n");
    },

    setMethod: (input: string, updateFn: (method: string) => string) => {
      const lines = input.split("\n");
      const firstLine = lines[0];
      if (!firstLine) {
        throw new Error("No lines in input");
      }

      const [method, path, version] = firstLine.split(" ");
      if (method && path && version) {
        lines[0] = `${updateFn(method)} ${path} ${version}`;
        return lines.join("\n");
      }
      return input;
    },

    addHeader: (input: string, header: string) => {
      const lines = input.split("\n");
      const headersIndex = lines.findIndex((line) => line.trim() === "");
      if (headersIndex === -1) {
        lines.push(header);
      } else {
        lines.splice(headersIndex, 0, header);
      }
      return lines.join("\n");
    },

    removeHeader: (input: string, header: string) => {
      const lines = input.split("\n");
      return lines.filter((line) => !line.startsWith(header)).join("\n");
    },

    setBody: (input: string, body: string) => {
      const lines = input.split("\n");
      const bodyIndex = lines.findIndex((line) => line.trim() === "");
      if (bodyIndex === -1) {
        lines.push("");
        lines.push(body);
      } else {
        lines.splice(bodyIndex + 1, lines.length - bodyIndex - 1, body);
      }
      return lines.join("\n");
    },

    getMethod: (input: string) => {
      const firstLine = input.split("\n")[0];
      if (!firstLine) {
        throw new Error("No lines in input");
      }
      return firstLine.split(" ")[0] || "";
    },

    getPath: (input: string) => {
      const firstLine = input.split("\n")[0];
      if (!firstLine || !firstLine.includes(" ")) {
        throw new Error("Invalid first line");
      }
      return firstLine.split(" ")[1]?.split("?")[0] || "";
    },

    getQuery: (input: string) => {
      const firstLine = input.split("\n")[0];
      if (!firstLine || !firstLine.includes(" ")) {
        throw new Error("Invalid first line");
      }
      return firstLine.split(" ")[1]?.split("?")[1] || "";
    },

    hasHeader: (input: string, header: string) => {
      const lines = input.split("\n");
      const headersIndex = lines.findIndex((line) => line.trim() === "");
      if (headersIndex === -1) {
        return false;
      }
      const headerLines = lines.slice(headersIndex + 1);
      return headerLines.some((line) => line.startsWith(header + ":"));
    },
  };

  try {
    const userFunction = new Function("helper", "input", script);
    const result = userFunction(helper, initialInput);
    const results = Array.isArray(result) ? result : [result];
    return {
      success: true,
      requests: results,
    };
  } catch (error) {
    return {
      success: false,
      requests: [],
      error: error,
    };
  }
};
