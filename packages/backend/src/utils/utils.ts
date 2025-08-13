import { mkdir } from "fs/promises";
import * as path from "path";

import { type SDK } from "caido:plugin";
import { type Template } from "shared";

export async function ensureDir(sdk: SDK): Promise<boolean> {
  try {
    const dir = getTemplateDir(sdk);
    await mkdir(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export function getTemplatePath(sdk: SDK, templateID: string): string {
  return path.join(sdk.meta.path(), "templates", templateID + ".yaml");
}

export function getTemplateDir(sdk: SDK): string {
  return path.join(sdk.meta.path(), "templates");
}

export function validateTemplate(template: Template): {
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
