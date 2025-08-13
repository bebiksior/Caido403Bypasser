import { readdir, readFile, rm, writeFile } from "fs/promises";
import * as path from "path";

import { type SDK } from "caido:plugin";
import { type Result, type Template } from "shared";
import YAML from "yaml";
import * as fs from "fs/promises";

import defaultTemplates from "../defaultTemplates";
import { TemplateStore } from "../stores/templates";
import { type CaidoBackendSDK } from "../types";
import {
  getTemplateDir,
  getTemplatePath,
  validateTemplate,
} from "../utils/utils";

export function getTemplates(): Result<Template[]> {
  const templateStore = TemplateStore.get();
  const templates = templateStore.getTemplates();

  try {
    return { kind: "Success", value: templates };
  } catch (error) {
    return {
      kind: "Error",
      error: `Failed to get templates: ${(error as Error).message}`,
    };
  }
}

export async function resetTemplates(sdk: SDK): Promise<Result<void>> {
  const templateStore = TemplateStore.get();
  templateStore.clearTemplates();
  templateStore.addTemplates(defaultTemplates);
  await writeTemplates(sdk, defaultTemplates);
  return { kind: "Success", value: undefined };
}

export function clearTemplates(): Result<void> {
  const templateStore = TemplateStore.get();
  templateStore.clearTemplates();
  return { kind: "Success", value: undefined };
}
export function getTemplate(_: SDK, templateID: string): Result<Template> {
  const templateStore = TemplateStore.get();
  const template = templateStore.getTemplate(templateID);
  if (!template) {
    return {
      kind: "Error",
      error: `Template not found: ${templateID}`,
    };
  }

  return { kind: "Success", value: template };
}

export async function getRawTemplate(
  sdk: SDK,
  templateFileName: string
): Promise<Result<string>> {
  const templateStore = TemplateStore.get();

  try {
    const template = templateStore.getTemplate(templateFileName);
    if (!template) {
      return {
        kind: "Error",
        error: `Template not found: ${templateFileName}`,
      };
    }

    const templatePath = getTemplatePath(sdk, templateFileName);
    const content = await readFile(templatePath, "utf-8");
    return { kind: "Success", value: content };
  } catch (error) {
    return {
      kind: "Error",
      error: `Failed to get raw template: ${(error as Error).message}`,
    };
  }
}

export async function removeTemplate(
  sdk: CaidoBackendSDK,
  templateID: string
): Promise<Result<void>> {
  const templateStore = TemplateStore.get();
  const template = templateStore.getTemplate(templateID);
  if (!template) {
    return {
      kind: "Error",
      error: `Template not found: ${templateID}`,
    };
  }

  const templatePath = getTemplatePath(sdk, templateID);
  sdk.console.log(`Removing template ${templatePath}`);

  try {
    await rm(templatePath);
    templateStore.deleteTemplate(template.id);
    sdk.api.send("templates:deleted", template.id);
    return { kind: "Success", value: undefined };
  } catch (error) {
    return {
      kind: "Error",
      error: `Error removing template ${template.id}: ${
        (error as Error).message
      }`,
    };
  }
}

export async function loadTemplates(sdk: CaidoBackendSDK) {
  const templateStore = TemplateStore.get();

  const templateDir = getTemplateDir(sdk);
  const files = await readdir(templateDir);
  if (files === undefined) {
    return;
  }

  const loadTemplatePromises = files
    .filter((file) => path.extname(file).toLowerCase() === ".yaml")
    .map(async (file) => {
      const templatePath = path.join(sdk.meta.path(), "templates", file);
      try {
        const yamlStr = (await fs.readFile(
          templatePath,
          "utf-8"
        )) as string;
        const data = YAML.parse(yamlStr) as Template;
        const { valid, message } = validateTemplate(data);

        if (valid) {
          templateStore.addTemplate(data);
          sdk.api.send("templates:created", data);
        } else {
          sdk.console.error(`Invalid template ${file}: ${message}`);
        }
      } catch (error) {
        sdk.console.error(`Error loading template ${file}: ${error}`);
      }
    });

  await Promise.all(loadTemplatePromises);
}

export async function writeTemplates(sdk: SDK, templates: Template[]) {
  const templatePromises = templates.map((template) =>
    writeTemplate(sdk, template)
  );

  await Promise.all(templatePromises);
}

export async function writeTemplate(sdk: SDK, template: Template) {
  const templatePath = getTemplatePath(sdk, template.id);
  const templateData = {
    id: template.id,
    description: template.description,
    enabled: template.enabled,
    modificationScript: template.modificationScript,
  };

  const yamlData = YAML.stringify(templateData);

  await writeFile(templatePath, yamlData);
}

export function createTemplate(
  sdk: CaidoBackendSDK,
  template: Template,
  currentTemplateID?: string
): Template {
  const templateStore = TemplateStore.get();
  if (templateStore.existsTemplate(template.id)) {
    throw new Error(`Template with ID ${template.id} already exists`);
  }

  writeTemplate(sdk, template);
  templateStore.addTemplate(template);
  sdk.api.send("templates:created", template, currentTemplateID);

  return template;
}

export function importTemplate(sdk: SDK, raw: string): Result<Template> {
  try {
    const template = YAML.parse(raw) as Template;
    const { valid, message } = validateTemplate(template);

    if (!valid) {
      return { kind: "Error", error: `Invalid template: ${message}` };
    }

    const newTemplate = createTemplate(sdk, template);
    return { kind: "Success", value: newTemplate };
  } catch (error) {
    return {
      kind: "Error",
      error: `Failed to import template: ${(error as Error).message}`,
    };
  }
}

export async function exportTemplate(
  sdk: SDK,
  templateID: string
): Promise<Result<string>> {
  const templateStore = TemplateStore.get();
  try {
    const template = templateStore.getTemplate(templateID);
    if (!template) {
      return {
        kind: "Error",
        error: `Template not found: ${templateID}`,
      };
    }

    const rawTemplate = await getRawTemplate(sdk, templateID);
    if (rawTemplate.kind === "Error") {
      return { kind: "Error", error: rawTemplate.error };
    }

    return { kind: "Success", value: rawTemplate.value };
  } catch (error) {
    return {
      kind: "Error",
      error: `Failed to export template: ${(error as Error).message}`,
    };
  }
}

export async function saveTemplate(
  sdk: CaidoBackendSDK,
  currentTemplateID: string,
  newTemplate: Template
): Promise<Result<void>> {
  const templateStore = TemplateStore.get();

  try {
    const { valid, message } = validateTemplate(newTemplate);
    if (!valid) {
      return { kind: "Error", error: `Invalid template: ${message}` };
    }

    const template = templateStore.getTemplate(currentTemplateID);

    if (template) {
      if (currentTemplateID !== newTemplate.id) {
        if (templateStore.existsTemplate(newTemplate.id)) {
          return {
            kind: "Error",
            error: `Template with ID ${newTemplate.id} already exists`,
          };
        }

        await removeOldTemplateFile(sdk, currentTemplateID);
        templateStore.remapTemplate(currentTemplateID, newTemplate.id);
      }

      templateStore.setTemplate(newTemplate.id, newTemplate);
      sdk.api.send("templates:updated", currentTemplateID, newTemplate);

      await writeTemplate(sdk, newTemplate);
    } else {
      createTemplate(sdk, newTemplate, currentTemplateID);
    }

    return { kind: "Success", value: undefined };
  } catch (error) {
    return {
      kind: "Error",
      error: `Failed to save template: ${(error as Error).message}`,
    };
  }
}

async function removeOldTemplateFile(sdk: SDK, oldTemplateID: string) {
  const oldTemplatePath = getTemplatePath(sdk, oldTemplateID);

  try {
    await rm(oldTemplatePath);
  } catch (error) {
    sdk.console.error(
      `Error removing old template file ${oldTemplatePath}: ${error}`
    );
  }
}
