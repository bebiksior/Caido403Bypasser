import { useSDKStore } from "@/stores/sdkStore";
import { CaidoSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";

export const useSettingsRepostiory = (sdk: CaidoSDK = useSDKStore.getState().getSDK()) => {
  const getSettings = async () => {
    const result = await handleBackendCall(sdk.backend.getSettings(), sdk);
    return result;
  };

  const updateSettings = async (settings: any) => {
    const result = await handleBackendCall(
      sdk.backend.updateSettings(settings),
      sdk
    );
    return result;
  };

  return {
    getSettings,
    updateSettings,
  };
};
