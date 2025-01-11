export interface Helper {
  // Setters
  setLine: (
    input: string,
    lineNumber: number,
    updateFn: (line: string | undefined) => string
  ) => string;
  setPath: (
    input: string,
    update: string | ((path: string) => string)
  ) => string;
  setQuery: (
    input: string,
    update: string | ((query: string) => string)
  ) => string;
  setMethod: (
    input: string,
    update: string | ((method: string) => string)
  ) => string;
  setBody: (
    input: string,
    update: string | ((body: string) => string)
  ) => string;
  addQueryParameter: (input: string, param: string) => string;
  addHeader: (input: string, header: string) => string;
  removeHeader: (input: string, header: string) => string;

  // Getters
  getMethod: (input: string) => string;
  getPath: (input: string) => string;
  getQuery: (input: string) => string;
  getBody: (input: string) => string;

  // Checks
  hasHeader: (input: string, header: string) => boolean;
}

interface TemplateOutput {
  success: boolean;
  requests: string[];
  error?: unknown;
}

export function runScript(
  initialInput: string,
  script: string
): TemplateOutput {
  const helper: Helper = {
    setLine: (
      input: string,
      lineNumber: number,
      updateFn: (line: string | undefined) => string
    ) => {
      const lines = input.split("\r\n");
      lines[lineNumber] = updateFn(lines[lineNumber]);
      return lines.join("\r\n");
    },

    setPath: (input: string, update: string | ((path: string) => string)) => {
      const lines = input.split("\r\n");
      const firstLine = lines[0];
      if (!firstLine) throw new Error("No lines in input");

      const [method, url, version] = firstLine.split(" ");
      if (!method || !url || !version) throw new Error("Invalid first line");

      const [path, query] = url.split("?", 2);
      if (!path) throw new Error("Invalid URL");

      const updatedPath = typeof update === "function" ? update(path) : update;

      lines[0] = query
        ? `${method} ${updatedPath}?${query} ${version}`
        : `${method} ${updatedPath} ${version}`;

      return lines.join("\r\n");
    },

    addQueryParameter: (input: string, param: string) => {
      const lines = input.split("\r\n");
      const firstLine = lines[0];
      if (!firstLine) throw new Error("No lines in input");

      const [method, url, version] = firstLine.split(" ");
      if (!method || !url || !version) throw new Error("Invalid first line");

      const [path, query] = url.split("?", 2);
      const updatedQuery = query ? `${query}&${param}` : param;

      lines[0] = updatedQuery
        ? `${method} ${path}?${updatedQuery} ${version}`
        : `${method} ${path} ${version}`;

      return lines.join("\r\n");
    },

    setQuery: (input: string, update: string | ((query: string) => string)) => {
      const lines = input.split("\r\n");
      const firstLine = lines[0];
      if (!firstLine) throw new Error("No lines in input");

      const [method, url, version] = firstLine.split(" ");
      if (!method || !url || !version) throw new Error("Invalid first line");

      const [path, query] = url.split("?", 2);
      const updatedQuery =
        typeof update === "function" ? update(query || "") : update;

      lines[0] = updatedQuery
        ? `${method} ${path}?${updatedQuery} ${version}`
        : `${method} ${path} ${version}`;

      return lines.join("\r\n");
    },

    setMethod: (
      input: string,
      update: string | ((method: string) => string)
    ) => {
      const lines = input.split("\r\n");
      const firstLine = lines[0];
      if (!firstLine) throw new Error("No lines in input");

      const [method, path, version] = firstLine.split(" ");
      if (method && path && version) {
        lines[0] =
          typeof update === "function"
            ? `${update(method)} ${path} ${version}`
            : `${update} ${path} ${version}`;
        return lines.join("\r\n");
      }
      return input;
    },

    addHeader: (input: string, header: string) => {
      const lines = input.split("\r\n");
      const headersIndex = lines.findIndex((line) => line.trim() === "");
      if (headersIndex === -1) {
        lines.push(header);
      } else {
        lines.splice(headersIndex, 0, header);
      }
      return lines.join("\r\n");
    },

    removeHeader: (input: string, header: string) => {
      const lines = input.split("\r\n");
      return lines.filter((line) => !line.startsWith(header)).join("\r\n");
    },

    setBody: (input: string, update: string | ((body: string) => string)) => {
      const lines = input.split("\r\n");
      const bodyIndex = lines.findIndex((line) => line.trim() === "");
      const currentBody = bodyIndex === -1 ? "" : lines.slice(bodyIndex + 1).join("\r\n");
      const newBody = typeof update === "function" ? update(currentBody) : update;

      if (bodyIndex === -1) {
        lines.push("");
        lines.push(newBody);
      } else {
        lines.splice(bodyIndex + 1, lines.length - bodyIndex - 1, newBody);
      }
      return lines.join("\r\n");
    },

    getMethod: (input: string) => {
      const firstLine = input.split("\r\n")[0];
      if (!firstLine) throw new Error("No lines in input");
      return firstLine.split(" ")[0] || "";
    },

    getPath: (input: string) => {
      const firstLine = input.split("\r\n")[0];
      if (!firstLine || !firstLine.includes(" "))
        throw new Error("Invalid first line");
      return firstLine.split(" ")[1]?.split("?")[0] || "";
    },

    getBody: (input: string) => {
      const lines = input.split("\r\n");
      const bodyIndex = lines.findIndex((line) => line.trim() === "");
      if (bodyIndex === -1) return "";
      return lines.slice(bodyIndex + 1).join("\r\n");
    },

    getQuery: (input: string) => {
      const firstLine = input.split("\r\n")[0];
      if (!firstLine || !firstLine.includes(" "))
        throw new Error("Invalid first line");
      return firstLine.split(" ")[1]?.split("?")[1] || "";
    },

    hasHeader: (input: string, header: string) => {
      const lines = input.split("\r\n");
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (line === "") break;
        if (line?.startsWith(header + ":")) return true;
      }
      return false;
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
      error,
    };
  }
}
