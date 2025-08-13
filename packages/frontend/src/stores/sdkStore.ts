import { create } from "zustand";

import { type FrontendSDK } from "@/types/types";

type SDKStore = {
  sdk: FrontendSDK | undefined;
  setSDK: (sdk: FrontendSDK) => void;
  getSDK: () => FrontendSDK;
}

export const useSDKStore = create<SDKStore>((set, get) => ({
  sdk: undefined,
  setSDK: (sdk: FrontendSDK) => set({ sdk }),
  getSDK: () => {
    const sdk = get().sdk;
    if (!sdk) {
      throw new Error("SDK is not initialized.");
    }
    return sdk;
  },
}));

export const initializeSDK = (sdk: FrontendSDK) => {
  useSDKStore.getState().setSDK(sdk);
};
