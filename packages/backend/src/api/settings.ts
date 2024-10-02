import { SDK } from "caido:plugin";
import { Result, Settings } from "shared";
import * as path from "path";
import { readFile, writeFile } from "fs/promises";
import { SettingsStore } from "../stores/settings";
import { fixWindowsPath } from "@/utils/utils";

export const getSettings = async (sdk: SDK): Promise<Result<Settings>> => {
  const settingsStore = SettingsStore.get();
  return {
    kind: "Success",
    value: {
      baseDir: sdk.meta.path(),
      ...settingsStore.getSettings(),
    },
  };
};

export const updateSettings = async (
  sdk: SDK,
  newSettings: Settings
): Promise<Result<Settings>> => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();

  settingsStore.updateSettings(newSettings);
  await saveSettingsToFile(sdk, settings);

  return { kind: "Success", value: settings };
};

const saveSettingsToFile = async (sdk: SDK, settings: Settings) => {
  const settingsPath = fixWindowsPath(
    path.join(sdk.meta.path(), "settings.json")
  );
  await writeFile(settingsPath, JSON.stringify(settings, null, 2));
};

export const loadSettingsFromFile = async (sdk: SDK) => {
  const settingsStore = SettingsStore.get();
  const settings = settingsStore.getSettings();

  const settingsPath = fixWindowsPath(
    path.join(sdk.meta.path(), "settings.json")
  );
  try {
    const _settings = JSON.parse(await readFile(settingsPath, "utf-8"));
    Object.assign(settings, _settings);
  } catch (error) {
    // If settings.json doesn't exist, create it. I assume that every error is due to the file not existing, TODO: improve this.
    await saveSettingsToFile(sdk, settings);
  }
};
