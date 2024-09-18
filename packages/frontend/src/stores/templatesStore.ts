import { useTemplatesRepostiory } from "@/repositories/templates";
import { useSDKStore } from "@/stores/sdkStore";
import { Template } from "shared";
import { create } from "zustand";

interface TemplateStore {
    templates: Template[];
    setTemplates: (templates: Template[] | ((prevTemplates: Template[]) => Template[])) => void;
    
    selectedTemplateID: string | undefined;
    setSelectedTemplateID: (selectedTemplateID: string) => void;
    deselectTemplate: () => void;
    initialize: () => Promise<void>;
}

export const useTemplatesStore = create<TemplateStore>((set, get) => ({
    templates: [],
    setTemplates: (templates: Template[] | ((prevTemplates: Template[]) => Template[])) =>
        set((state: { templates: Template[]; }) => ({
            templates: typeof templates === "function" ? templates(state.templates) : templates,
        })),
    selectedTemplateID: undefined,
    setSelectedTemplateID: (selectedTemplateID: string) => set({ selectedTemplateID }),
    deselectTemplate: () => set({ selectedTemplateID: undefined }),

    initialize: async () => {
        const sdk = useSDKStore.getState().getSDK();

        sdk.backend.onEvent("templates:created", (template: Template, oldTemplateID?: string) => {
            const templates = get().templates;
            const oldTemplate = templates.find((t) => t.id === oldTemplateID);
            if (oldTemplate) {
                get().setTemplates(templates.map((t) => (t.id === oldTemplateID ? template : t)));
                get().setSelectedTemplateID(template.id);
                return;
            }

            get().setTemplates([...templates, template]);
            get().setSelectedTemplateID(template.id);
        });

        sdk.backend.onEvent("templates:deleted", (templateID: string) => {
            const templates = get().templates;
            const selectedTemplateID = get().selectedTemplateID;
            if (selectedTemplateID === templateID) {
                get().deselectTemplate();
            }
            get().setTemplates(templates.filter((template) => template.id !== templateID));
        });

        sdk.backend.onEvent("templates:updated", (templateID, fields) => {
            const templates = get().templates;
            const template = templates.find((t) => t.id === templateID);
            if (fields.id && template && get().selectedTemplateID === template.id) {
                get().setSelectedTemplateID(fields.id);
            }

            get().setTemplates(templates.map((t) => (t.id === templateID ? { ...t, ...fields } : t)));;
        });

        const { getTemplates } = useTemplatesRepostiory(sdk);
        const templates = await getTemplates();
        get().setTemplates(templates);
    },
}));