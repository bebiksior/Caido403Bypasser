import { useSDKStore } from "@/stores/sdkStore";
import { CaidoSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";
import { Template } from "shared";

export const useTemplatesRepostiory = (sdk: CaidoSDK = useSDKStore.getState().getSDK()) => {
  const getTemplates = async () => {
    const result = await handleBackendCall(sdk.backend.getTemplates(), sdk);
    return result;
  };

  const getRawTemplate = async (id: string) => {
    const result = await handleBackendCall(sdk.backend.getRawTemplate(id), sdk);
    return result;
  };

  const saveTemplate = async (
    currentTemplateID: string,
    template: Template
  ) => {
    const result = await handleBackendCall(
      sdk.backend.saveTemplate(currentTemplateID, template),
      sdk
    );
    return result;
  };

  const removeTemplate = async (id: string) => {
    const result = await handleBackendCall(sdk.backend.removeTemplate(id), sdk);
    return result;
  };

  const exportTemplate = async (id: string) => {
    const result = await handleBackendCall(sdk.backend.exportTemplate(id), sdk);
    return result;
  };

  const importTemplate = async (templateStr: string) => {
    const result = await handleBackendCall(
      sdk.backend.importTemplate(templateStr),
      sdk
    );
    return result;
  };

  return {
    getTemplates,
    getRawTemplate,
    saveTemplate,
    removeTemplate,
    exportTemplate,
    importTemplate,
  };
};
