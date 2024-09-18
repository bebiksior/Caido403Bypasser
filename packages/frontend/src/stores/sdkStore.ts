import { CaidoSDK } from "@/types/types";
import { create } from "zustand";

interface SDKStore {
  sdk: CaidoSDK | null;
  setSDK: (sdk: CaidoSDK) => void;
  getSDK: () => CaidoSDK;
}

export const useSDKStore = create<SDKStore>((set, get) => ({
  sdk: null,
  setSDK: (sdk: CaidoSDK) => set({ sdk }),
  getSDK: () => {
    const sdk = get().sdk;
    if (!sdk) {
      throw new Error('SDK is not initialized.');
    }
    return sdk;
  },
}));

export const initializeSDK = (sdk: CaidoSDK) => {
  useSDKStore.getState().setSDK(sdk);
};