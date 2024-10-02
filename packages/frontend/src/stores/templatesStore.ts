import { QueryClient, useQuery } from "@tanstack/react-query";
import { useSDKStore } from "@/stores/sdkStore";
import { create } from "zustand";
import { handleBackendCall } from "@/utils/utils";
import { Template } from "shared";
import { CaidoSDK } from "@/types/types";

interface TemplateStore {
  selectedTemplateID: string | undefined;
  setSelectedTemplateID: (selectedTemplateID: string) => void;
  deselectTemplate: () => void;
}

export const useTemplatesLocalStore = create<TemplateStore>((set, get) => ({
  selectedTemplateID: undefined,
  setSelectedTemplateID: (selectedTemplateID: string) =>
    set({ selectedTemplateID }),
  deselectTemplate: () => set({ selectedTemplateID: undefined }),
}));

// Calls sdk.backend.getTemplates()
export const useTemplates = () => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["templates"],
    queryFn: () => handleBackendCall(sdk.backend.getTemplates(), sdk),
  });

  return { templates: data, isLoading, isError, error };
};

// Calls sdk.backend.getTemplate(templateID)
export const useTemplate = (templateID: string) => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["template", templateID],
    queryFn: () => handleBackendCall(sdk.backend.getTemplate(templateID), sdk),
  });

  return { template: data, isLoading, isError, error };
};

// Calls sdk.backend.removeTemplate(templateID)
export const removeTemplate = async (templateID: string) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.removeTemplate(templateID),
    sdk
  );
  return result;
};

// Calls sdk.backend.saveTemplate(currentTemplateID, template)
export const saveTemplate = async (
  currentTemplateID: string,
  template: Template
) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.saveTemplate(currentTemplateID, template),
    sdk
  );
  return result;
};

// Calls sdk.backend.exportTemplate(templateID)
export const exportTemplate = async (templateID: string) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.exportTemplate(templateID),
    sdk
  );
  return result;
};

// Calls sdk.backend.importTemplate(rawTemplate)
export const importTemplate = async (rawTemplate: string) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.importTemplate(rawTemplate),
    sdk
  );
  return result;
};

export const addTempTemplate = async (
  template: Template,
  queryClient: QueryClient
) => {
  queryClient.setQueryData(["templates"], (oldTemplates: Template[]) => [
    ...oldTemplates,
    template,
  ]);
};

export const removeTempTemplate = async (
  templateID: string,
  queryClient: QueryClient
) => {
  queryClient.setQueryData(["templates"], (oldTemplates: Template[]) =>
    oldTemplates.filter((t) => t.id !== templateID)
  );
};

export const updateTempTemplate = async (
  templateID: string,
  fields: Partial<Template>,
  queryClient: QueryClient
) => {
  queryClient.setQueryData(["templates"], (oldTemplates: Template[]) =>
    oldTemplates.map((t) => (t.id === templateID ? { ...t, ...fields } : t))
  );

  if (fields.id && fields.id !== templateID) {
    const templatesLocalStore = useTemplatesLocalStore.getState();
    if (templatesLocalStore.selectedTemplateID === templateID) {
      templatesLocalStore.setSelectedTemplateID(fields.id);
    }
  }
};

export const initializeEvents = (sdk: CaidoSDK, queryClient: QueryClient) => {
  sdk.backend.onEvent(
    "templates:created",
    (template: Template, oldTemplateID?: string) => {
      addTempTemplate(template, queryClient);
    }
  );

  sdk.backend.onEvent("templates:deleted", (templateID: string) => {
    removeTempTemplate(templateID, queryClient);
  });

  sdk.backend.onEvent(
    "templates:updated",
    (templateID: string, fields: Partial<Template>) => {
      updateTempTemplate(templateID, fields, queryClient);
    }
  );
};
