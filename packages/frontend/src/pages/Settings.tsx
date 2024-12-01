import { StyledBox } from "caido-material-ui";
import { useSDKStore } from "@/stores/sdkStore";
import { useSettings, useUpdateSettings } from "@/stores/settingsStore";
import { Button, Input } from "@mui/material";
import { useEffect, useState } from "react";
import { Settings } from "shared";

export default function SettingsPage() {
  const sdk = useSDKStore.getState().getSDK();
  const { data, isLoading, isError, error } = useSettings();
  const { updateSettings } = useUpdateSettings();
  const [draftSettings, setDraftSettings] = useState<Settings | undefined>(
    undefined,
  );

  useEffect(() => {
    if (data) {
      setDraftSettings(data);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (!data || !draftSettings) return <div>No data</div>;

  const handleSave = () => {
    if (!draftSettings) return;
    updateSettings({ newSettings: draftSettings });
    sdk.window.showToast("Settings saved", { variant: "success" });
  };

  const updateDraftSettings = (key: keyof Settings, value: any) => {
    setDraftSettings((prev) => ({ ...prev, [key]: value }) as Settings);
  };

  return (
    <StyledBox className="p-5">
      <h1 className="text-lg font-semibold m-0">Settings</h1>
      <p className="text-base text-gray-400 mt-0 select-text">
        Settings and templates are stored in <b>{data?.baseDir}</b>
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
              for AI Generate feature. You can generate it{" "}
              <a
                href="https://platform.openai.com/settings/profile?tab=api-keys"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              .
            </p>
            <Input
              id="openAIApiKey"
              value={draftSettings?.openAIKey}
              onChange={(e) => updateDraftSettings("openAIKey", e.target.value)}
              type="password"
              className="w-full"
            />
          </div>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={draftSettings?.openAIKey === data?.openAIKey}
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
              value={draftSettings?.templatesDelay?.toString()}
              onChange={(e) =>
                updateDraftSettings("templatesDelay", e.target.value)
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
              value={draftSettings?.scanTimeout?.toString()}
              onChange={(e) =>
                updateDraftSettings("scanTimeout", e.target.value)
              }
              className="w-full"
            />
          </div>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              draftSettings?.templatesDelay === data?.templatesDelay &&
              draftSettings?.scanTimeout === data?.scanTimeout
            }
          >
            Save
          </Button>
        </div>
      </div>
    </StyledBox>
  );
}
