import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { type Template } from "shared";
import { create } from "zustand";

import { useSDKStore } from "@/stores/sdkStore";
import { type FrontendSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";

type TemplateStore = {
  selectedTemplateID: string | undefined;
  setSelectedTemplateID: (selectedTemplateID: string) => void;
  deselectTemplate: () => void;
}

export const useTemplatesLocalStore = create<TemplateStore>((set) => ({
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
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
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

// Calls sdk.backend.addTemplate(template)
export const useAddTemplate = () => {
  const sdk = useSDKStore.getState().getSDK();
  const { mutate, isError, error } = useMutation({
    mutationFn: (template: Template) => {
      return handleBackendCall(
        sdk.backend.saveTemplate(template.id, template),
        sdk,
      );
    },
  });
  return { addTemplate: mutate, isError, error };
};

// Calls sdk.backend.resetTemplates()
export const useResetTemplates = () => {
  const queryClient = useQueryClient();
  const sdk = useSDKStore.getState().getSDK();
  const { mutate, isError, error } = useMutation({
    mutationFn: () => handleBackendCall(sdk.backend.resetTemplates(), sdk),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
  return { resetTemplates: mutate, isError, error };
};

// Calls sdk.backend.clearTemplates()
export const useClearTemplates = () => {
  const queryClient = useQueryClient();
  const sdk = useSDKStore.getState().getSDK();
  const { mutate, isError, error } = useMutation({
    mutationFn: () => handleBackendCall(sdk.backend.clearTemplates(), sdk),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });
  return { clearTemplates: mutate, isError, error };
};

// Calls sdk.backend.removeTemplate(templateID)
export const removeTemplate = async (templateID: string) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.removeTemplate(templateID),
    sdk,
  );
  return result;
};

// Calls sdk.backend.saveTemplate(currentTemplateID, template)
export const saveTemplate = async (
  currentTemplateID: string,
  template: Template,
) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.saveTemplate(currentTemplateID, template),
    sdk,
  );
  return result;
};

// Calls sdk.backend.exportTemplate(templateID)
export const exportTemplate = async (templateID: string) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.exportTemplate(templateID),
    sdk,
  );
  return result;
};

// Calls sdk.backend.importTemplate(rawTemplate)
export const importTemplate = async (rawTemplate: string) => {
  const sdk = useSDKStore.getState().getSDK();
  const result = await handleBackendCall(
    sdk.backend.importTemplate(rawTemplate),
    sdk,
  );
  return result;
};

export const addTempTemplate = (
  template: Template,
  queryClient: QueryClient,
) => {
  queryClient.setQueryData(["templates"], (oldTemplates: Template[]) => [
    ...oldTemplates,
    template,
  ]);
};

export const removeTempTemplate = (
  templateID: string,
  queryClient: QueryClient,
) => {
  queryClient.setQueryData(["templates"], (oldTemplates: Template[]) =>
    oldTemplates.filter((t) => t.id !== templateID),
  );
};

export const updateTempTemplate = (
  templateID: string,
  fields: Partial<Template>,
  queryClient: QueryClient,
) => {
  queryClient.setQueryData(["templates"], (oldTemplates: Template[]) =>
    oldTemplates.map((t) => (t.id === templateID ? { ...t, ...fields } : t)),
  );

  if (fields.id !== undefined && fields.id !== templateID) {
    const templatesLocalStore = useTemplatesLocalStore.getState();
    if (templatesLocalStore.selectedTemplateID === templateID) {
      templatesLocalStore.setSelectedTemplateID(fields.id);
    }
  }
};

export const initializeEvents = (
  sdk: FrontendSDK,
  queryClient: QueryClient,
) => {
  sdk.backend.onEvent(
    "templates:created",
    (template: Template) => {
      addTempTemplate(template, queryClient);
    },
  );

  sdk.backend.onEvent("templates:deleted", (templateID: string) => {
    removeTempTemplate(templateID, queryClient);
  });

  sdk.backend.onEvent(
    "templates:updated",
    (templateID: string, fields: Partial<Template>) => {
      updateTempTemplate(templateID, fields, queryClient);
    },
  );
};
