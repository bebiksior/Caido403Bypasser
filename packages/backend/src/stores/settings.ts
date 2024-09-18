import { Settings } from "shared";

export class SettingsStore {
  private static instance: SettingsStore;

  private settings: Settings;

  private constructor() {
    this.settings = {
      templatesDelay: 100,
      scanTimeout: 30000,
      openAIKey: ""
    };
  }

  static get(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore();
    }

    return SettingsStore.instance;
  }

  getSettings(): Settings {
    return this.settings;
  }

  updateSettings(newSettings: Settings): Settings {
    this.settings = newSettings;
    return this.settings;
  }

  updateSetting(key: string, value: any): Settings {
    Object.assign(this.settings, { [key]: value });
    return this.settings;
  }
}
