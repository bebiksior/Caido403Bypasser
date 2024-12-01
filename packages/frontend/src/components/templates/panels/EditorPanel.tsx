import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOpenAIStream, handleBackendCall } from "@/utils/utils";
import { useSDKStore } from "@/stores/sdkStore";
import { aiSystemPrompt } from "@/constants";
import { runScript, Template } from "shared";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-chaos";
import { StyledBox } from "caido-material-ui";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  TextareaAutosize,
} from "@mui/material";
import { useTemplates, useTemplatesLocalStore } from "@/stores/templatesStore";
import useTestStore from "@/stores/testsStore";
import { useSettings } from "@/stores/settingsStore";

const EditorPanel = () => {
  const sdk = useSDKStore.getState().getSDK();
  const { selectedTemplateID } = useTemplatesLocalStore();
  const { templates } = useTemplates();
  const { data: settings, isLoading, isError, error } = useSettings();

  const testContent = useTestStore((state) => state.testContent);
  const setTestResults = useTestStore((state) => state.setTestResults);

  const [aiDialogVisible, setAIDialogVisible] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");

  const [draftId, setDraftId] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftScript, setDraftScript] = useState("");

  const selectedTemplate = useMemo(
    () => templates?.find((t) => t.id === selectedTemplateID),
    [templates, selectedTemplateID],
  );

  if (!selectedTemplate) return;

  useEffect(() => {
    if (selectedTemplate) {
      setDraftId(selectedTemplate.id);
      setDraftDescription(selectedTemplate.description || "");
      setDraftScript(selectedTemplate.modificationScript || "");
    }
  }, [selectedTemplate]);

  const onTestClick = useCallback(() => {
    const results = runScript(testContent, draftScript);
    if (results.success) {
      setTestResults(results.requests);
    } else {
      setTestResults([]);
      sdk.window.showToast("Error running script. Check console for details", {
        variant: "error",
      });
      console.error(results.error);
    }
  }, [testContent, draftScript, setTestResults, sdk]);

  const onSaveClick = useCallback(async () => {
    if (!selectedTemplate) return;

    if (!draftId || !draftDescription || !draftScript) {
      sdk.window.showToast("Please fill all fields", { variant: "error" });
      return;
    }

    const updatedTemplate: Template = {
      ...selectedTemplate,
      id: draftId,
      description: draftDescription,
      modificationScript: draftScript,
    };

    await handleBackendCall(
      sdk.backend.saveTemplate(selectedTemplate.id, updatedTemplate),
      sdk,
    );

    sdk.window.showToast("Template saved", { variant: "success" });
  }, [draftId, draftDescription, draftScript, selectedTemplate, sdk]);

  const onAIAskClick = useCallback(async () => {
    setAIDialogVisible(false);
    setDraftScript("");

    let aiResponse = "";
    fetchOpenAIStream(
      settings?.openAIKey || "",
      aiPrompt,
      aiSystemPrompt,
      (content: string) => {
        aiResponse += content;

        const idMatch = /---ID\s*?\n([\w-]+)/.exec(aiResponse);
        if (idMatch) setDraftId(idMatch[1] || "");

        const descriptionMatch = /---DESCRIPTION\s*?\n(.+)/.exec(aiResponse);
        if (descriptionMatch) setDraftDescription(descriptionMatch[1] || "");

        const scriptMatch = /---SCRIPT\s*?\n([\s\S]+)/.exec(aiResponse);
        if (scriptMatch) setDraftScript(scriptMatch[1] || "");
      },
    );
  }, [aiPrompt, settings]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (!settings) return <div>No settings</div>;

  const isAIKeyValid = settings.openAIKey && settings.openAIKey !== "";
  const hasUnsavedChanges =
    draftId !== selectedTemplate?.id ||
    draftDescription !== selectedTemplate?.description ||
    draftScript !== selectedTemplate?.modificationScript;

  if (!selectedTemplate) {
    return (
      <StyledBox className="h-full w-full">
        <div className="flex justify-center items-center h-full text-center text-zinc-500">
          <p>Select a template to edit</p>
        </div>
      </StyledBox>
    );
  }

  return (
    <StyledBox className="p-5">
      <div className="flex flex-col justify-around h-full">
        <h2 className="m-0 text-xl">Template Editor: {selectedTemplate.id}</h2>
        <div className="h-full w-full flex flex-col gap-4 mt-4 overflow-y-auto">
          <Input
            placeholder="ID"
            id="id"
            value={draftId}
            onChange={(event) => setDraftId(event.target.value)}
          />
          <Input
            placeholder="Description"
            id="description"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="modificationScript">Modification Script</label>
            <AceEditor
              mode="javascript"
              theme="chaos"
              wrapEnabled={true}
              showPrintMargin={false}
              value={draftScript}
              onChange={(value) => setDraftScript(value)}
              style={{ width: "100%", height: "220px" }}
              fontSize="100%"
              name="modificationScript"
              setOptions={{ useWorker: false }}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            color={hasUnsavedChanges ? "success" : "secondary"}
            variant="outlined"
            disabled={!hasUnsavedChanges}
            onClick={onSaveClick}
          >
            Save
          </Button>
          <Button variant="outlined" onClick={onTestClick}>
            Test
          </Button>
          <Button
            disabled={!isAIKeyValid}
            variant="outlined"
            color="info"
            autoCapitalize="none"
            onClick={() => setAIDialogVisible(true)}
          >
            AI Generate
          </Button>
          <Dialog
            open={aiDialogVisible}
            onClose={() => setAIDialogVisible(false)}
          >
            <DialogTitle>Generate script with AI</DialogTitle>
            <DialogContent>
              <TextareaAutosize
                placeholder="Prompt"
                minRows={10}
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "14px",
                  background: "var(--c-gray-800)",
                }}
              />
              <Button variant="contained" onClick={onAIAskClick}>
                Ask AI
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </StyledBox>
  );
};

export default EditorPanel;
