import { create } from "zustand";
import { Settings } from "shared";
import { useSDKStore } from "@/stores/sdkStore";
import { useSettingsRepostiory } from "@/repositories/settings";

interface SettingsStore {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  initialize: () => Promise<void>;
}

const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    openAIKey: "",
    templatesDelay: 100,
    scanTimeout: 30000,
  } as Settings,
  updateSettings: (newSettings) => {
    set({ settings: newSettings });
    const sdk = useSDKStore.getState().getSDK();
    const { updateSettings } = useSettingsRepostiory(sdk);
    updateSettings(newSettings);
  },
  initialize: async () => {
    const sdk = useSDKStore.getState().getSDK();
    const { getSettings } = useSettingsRepostiory(sdk);
    const settings = await getSettings();
    set({ settings });
  },
}));

export default useSettingsStore;
