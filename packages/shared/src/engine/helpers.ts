import { HttpForge } from "ts-http-forge";

import { type Helper } from "./types";

const getFirstLineOrThrow = (input: string): string => {
  const firstLine = input.split("\r\n")[0];
  if (firstLine === undefined || firstLine === "")
    {throw new Error("No lines in input");}
  return firstLine;
};

const getRequestLineTokensOrThrow = (
  input: string,
): { method: string; url: string; version: string } => {
  const firstLine = getFirstLineOrThrow(input);
  const parts = firstLine.split(" ");
  const method = parts[0];
  const url = parts[1];
  const version = parts[2];
  if (
    method === undefined ||
    method === "" ||
    url === undefined ||
    url === "" ||
    version === undefined ||
    version === ""
  )
    {throw new Error("Invalid first line");}

  return { method, url, version };
};

const splitUrl = (url: string): { path: string; query: string | undefined } => {
  const [path, query] = url.split("?", 2);
  if (path === undefined || path === "") {throw new Error("Invalid URL");}
  return { path, query };
};

const getCurrentPathOrThrow = (input: string): string => {
  const { url } = getRequestLineTokensOrThrow(input);
  const { path } = splitUrl(url);
  return path;
};

const getCurrentQuery = (input: string): string | undefined => {
  const { url } = getRequestLineTokensOrThrow(input);
  const { query } = splitUrl(url);
  return query;
};

export const helpers: Helper = {
  setLine: (
    input: string,
    lineNumber: number,
    updateFn: (line: string | undefined) => string,
  ) => {
    const lines = input.split("\r\n");
    lines[lineNumber] = updateFn(lines[lineNumber]);
    return lines.join("\r\n");
  },

  setPath: (input: string, update: string | ((path: string) => string)) => {
    const currentPath = getCurrentPathOrThrow(input);
    const updatedPath =
      typeof update === "function" ? update(currentPath) : update;

    return HttpForge.create(input).path(updatedPath).build();
  },

  addQueryParameter: (input: string, param: string) => {
    const eqIndex = param.indexOf("=");
    if (eqIndex === -1) {
      const currentQuery = getCurrentQuery(input);
      const updatedQuery =
        currentQuery !== undefined && currentQuery !== ""
          ? `${currentQuery}&${param}`
          : param;

      return HttpForge.create(input).setQuery(updatedQuery).build();
    }

    const key = param.slice(0, eqIndex);
    const value = param.slice(eqIndex + 1);

    return HttpForge.create(input).addQueryParam(key, value).build();
  },

  setQuery: (input: string, update: string | ((query: string) => string)) => {
    const currentQuery = getCurrentQuery(input);
    const updatedQuery =
      typeof update === "function"
        ? update(currentQuery ?? "")
        : update;

    return HttpForge.create(input).setQuery(updatedQuery).build();
  },

  setMethod: (input: string, update: string | ((method: string) => string)) => {
    const { method } = getRequestLineTokensOrThrow(input);
    const newMethod = typeof update === "function" ? update(method) : update;

    return HttpForge.create(input).method(newMethod).build();
  },

  addHeader: (input: string, header: string) => {
    const idx = header.indexOf(":");
    const name = idx === -1 ? header : header.slice(0, idx).trim();
    const value = idx === -1 ? "" : header.slice(idx + 1).trim();

    return HttpForge.create(input).addHeader(name, value).build();
  },

  removeHeader: (input: string, header: string) => {
    const idx = header.indexOf(":");
    const name = idx === -1 ? header : header.slice(0, idx).trim();

    return HttpForge.create(input).removeHeader(name).build();
  },

  setBody: (input: string, update: string | ((body: string) => string)) => {
    const lines = input.split("\r\n");
    const bodyIndex = lines.findIndex((line) => line.trim() === "");
    const currentBody =
      bodyIndex === -1 ? "" : lines.slice(bodyIndex + 1).join("\r\n");
    const newBody = typeof update === "function" ? update(currentBody) : update;

    return HttpForge.create(input).body(newBody).build();
  },

  getMethod: (input: string) => {
    const { method } = getRequestLineTokensOrThrow(input);
    return method ?? "";
  },

  getPath: (input: string) => {
    const { url } = getRequestLineTokensOrThrow(input);
    const { path } = splitUrl(url);
    return path ?? "";
  },

  getBody: (input: string) => {
    const lines = input.split("\r\n");
    const bodyIndex = lines.findIndex((line) => line.trim() === "");
    if (bodyIndex === -1) {return "";}

    return lines.slice(bodyIndex + 1).join("\r\n");
  },

  getQuery: (input: string) => {
    const { url } = getRequestLineTokensOrThrow(input);
    const { query } = splitUrl(url);
    return query ?? "";
  },

  hasHeader: (input: string, header: string) => {
    const lines = input.split("\r\n");
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (line === "") {break;}
      if (line?.startsWith(header + ":")) {return true;}
    }

    return false;
  },
};
