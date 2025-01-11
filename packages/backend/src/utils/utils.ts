import { mkdir } from "fs/promises";
import { SDK } from "caido:plugin";
import * as path from "path";

export async function ensureDir(sdk: SDK): Promise<boolean> {
  try {
    const dir = getTemplateDir(sdk);
    await mkdir(dir, { recursive: true });
    return true;
  } catch (e) {
    return false;
  }
}

export function getTemplatePath(sdk: SDK, templateID: string): string {
  return path.join(sdk.meta.path(), "templates", templateID + ".yaml");
}

export function getTemplateDir(sdk: SDK): string {
  return path.join(sdk.meta.path(), "templates");
}

export function parseRequest(requestString: string): Record<string, any> {
  const request: Record<string, any> = {};
  const lines = requestString.split(/\r?\n/);

  const parsedRequestLine = parseRequestLine(lines.shift() || "");
  request["method"] = parsedRequestLine["method"];
  request["uri"] = parsedRequestLine["uri"];

  const headerLines: string[] = [];
  while (lines.length > 0) {
    const line = lines.shift();
    if (line === "") break;
    headerLines.push(line || "");
  }

  request["headers"] = parseHeaders(headerLines);
  request["body"] = lines.join("\r\n");

  return request;
}

export function parseResponse(responseString: string): Record<string, any> {
  const response: Record<string, any> = {};
  const lines = responseString.split(/\r?\n/);

  const parsedStatusLine = parseStatusLine(lines.shift() || "");
  response["protocolVersion"] = parsedStatusLine["protocol"];
  response["statusCode"] = parsedStatusLine["statusCode"];
  response["statusMessage"] = parsedStatusLine["statusMessage"];

  const headerLines: string[] = [];
  while (lines.length > 0) {
    const line = lines.shift();
    if (line === "") break;
    headerLines.push(line || "");
  }

  response["headers"] = parseHeaders(headerLines);
  response["body"] = lines.join("\r\n");

  return response;
}

export function parseHeaders(headerLines: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of headerLines) {
    const parts = line.split(":");
    const key = parts.shift()?.trim() || "";
    headers[key] = parts.join(":").trim();
  }
  return headers;
}

export function parseStatusLine(
  statusLine: string
): Record<string, string | undefined> {
  const parts = statusLine.match(/^(.+) ([0-9]{3}) (.*)$/);
  const parsed: Record<string, string | undefined> = {};

  if (parts !== null) {
    parsed["protocol"] = parts[1];
    parsed["statusCode"] = parts[2];
    parsed["statusMessage"] = parts[3];
  }

  return parsed;
}

export function parseRequestLine(
  requestLineString: string
): Record<string, string | undefined> {
  const parts = requestLineString.split(" ");
  const parsed: Record<string, string | undefined> = {};

  parsed["method"] = parts[0];
  parsed["uri"] = parts[1];
  parsed["protocol"] = parts[2];

  return parsed;
}

export function validateTemplate(template: any): {
  message?: string;
  valid: boolean;
} {
  if (typeof template !== "object" || template === null) {
    return {
      message: "Template must be an object",
      valid: false,
    };
  }

  if (typeof template.id !== "string" || template.id.trim() === "") {
    return {
      message: "Template must have a non-empty string ID",
      valid: false,
    };
  }

  if (!/^[a-zA-Z0-9-]+$/.test(template.id)) {
    return {
      message:
        "Template ID must only contain alphanumeric characters and dashes",
      valid: false,
    };
  }

  if (template.id.length > 100) {
    return {
      message: "Template ID must be less than 100 characters",
      valid: false,
    };
  }

  if (typeof template.enabled !== "boolean") {
    return {
      message: "Template must have a boolean enabled",
      valid: false,
    };
  }

  if (typeof template.modificationScript !== "string") {
    return {
      message: "Template must have a string modificationScript",
      valid: false,
    };
  }

  return {
    valid: true,
  };
}
