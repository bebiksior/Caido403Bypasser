import { type Template } from "shared";

export class TemplateStore {
  private static instance: TemplateStore;

  private templates: Map<string, Template>;

  private constructor() {
    this.templates = new Map();
  }

  static get(): TemplateStore {
    if (TemplateStore.instance === undefined) {
      TemplateStore.instance = new TemplateStore();
    }

    return TemplateStore.instance;
  }

  getTemplates(): Template[] {
    return [...this.templates.values()];
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  existsTemplate(id: string): boolean {
    return this.templates.has(id);
  }

  clearTemplates(): void {
    this.templates.clear();
  }

  addTemplate(template: Template): void {
    this.templates.set(template.id, template);
  }

  addTemplates(templates: Template[]): void {
    for (const template of templates) {
      this.addTemplate(template);
    }
  }

  deleteTemplate(id: string): void {
    this.templates.delete(id);
  }

  remapTemplate(oldID: string, newID: string): void {
    const template = this.templates.get(oldID);
    if (template) {
      this.templates.delete(oldID);
      this.templates.set(newID, template);
    }
  }

  toggleTemplate(id: string): void {
    const template = this.templates.get(id);
    if (template) {
      template.enabled = !template.enabled;
    }
  }

  updateTemplate(id: string, fields: Omit<Template, "id">) {
    const template = this.templates.get(id);
    if (template) {
      Object.assign(template, fields);
      return template;
    }
  }

  setTemplate(id: string, template: Template) {
    this.templates.set(id, template);
  }
}
