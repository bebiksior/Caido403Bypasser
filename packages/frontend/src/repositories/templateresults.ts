import { useSDKStore } from "@/stores/sdkStore";
import { CaidoSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";

export const useTemplateResultsRepostiory = (sdk: CaidoSDK = useSDKStore.getState().getSDK()) => {
  const getTemplateResults = async (scanID: number) => {
    const result = await handleBackendCall(
      sdk.backend.getTemplateResults(scanID),
      sdk
    );
    return result;
  };

  return {
    getTemplateResults,
  };
};
