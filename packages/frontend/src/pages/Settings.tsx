import StyledBox from "@/components/styled/StyledBox";
import { useSDKStore } from "@/stores/sdkStore";
import useSettingsStore from "@/stores/settingsStore";
import { Button, Input } from "@mui/material";
import { useState } from "react";

export default function Settings() {
  const sdk = useSDKStore.getState().getSDK();
  const { settings, updateSettings } = useSettingsStore();
  const [draftSettings, setDraftSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(draftSettings);
    sdk.window.showToast("Settings saved", { variant: "success" });
  };

  return (
    <StyledBox className="p-5">
      <h1 className="text-lg font-semibold m-0">Settings</h1>
      <p className="text-base text-gray-400 mt-0 select-text">
        Settings and templates are stored in <b>{settings.baseDir}</b>
      </p>
      <div className="flex gap-4 flex-wrap">
        <div
          className="flex flex-col gap-4 p-5 rounded-lg"
          style={{ background: "var(--c-bg-default)", width: "400px" }}
        >
          <div>
            <label htmlFor="openAIApiKey" className="block">
              OpenAI API Key
            </label>
            <p className="text-sm text-gray-400 mt-0">
              Your OpenAI API key to use the GPT-4o-mini API. This is required
              for AI Generate feature. You can generate it {" "}<a href="https://platform.openai.com/settings/profile?tab=api-keys" target="_blank" rel="noreferrer">here</a>.
            </p>
            <Input
              id="openAIApiKey"
              value={draftSettings.openAIKey}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  openAIKey: e.target.value,
                }))
              }
              type="password"
              className="w-full"
            />
          </div>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={draftSettings.openAIKey === settings.openAIKey}
          >
            Save
          </Button>
        </div>
        <div
          className="flex flex-col gap-4 p-5 rounded-lg"
          style={{ background: "var(--c-bg-default)", width: "400px" }}
        >
          <div>Template Settings</div>
          <div>
            <label htmlFor="templatesDelay" className="block">
              Templates Delay (ms)
            </label>

            <p className="text-sm text-gray-400 mt-0">
              Delay between each template execution
            </p>

            <Input
              id="templatesDelay"
              value={draftSettings.templatesDelay.toString()}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  templatesDelay: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="scanTimeout" className="block">
              Scan Timeout (ms)
            </label>
            <p className="text-sm text-gray-400 mt-0">
              If scan takes longer than this, it will be stopped
            </p>
            <Input
              id="scanTimeout"
              value={draftSettings.scanTimeout.toString()}
              onChange={(e) =>
                setDraftSettings((prev) => ({
                  ...prev,
                  scanTimeout: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              draftSettings.templatesDelay === settings.templatesDelay &&
              draftSettings.scanTimeout === settings.scanTimeout
            }
          >
            Save
          </Button>
        </div>
      </div>
    </StyledBox>
  );
}
