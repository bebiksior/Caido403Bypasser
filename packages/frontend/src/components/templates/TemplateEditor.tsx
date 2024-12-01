import React from "react";
import { StyledBox } from "caido-material-ui";
import { StyledSplitter } from "caido-material-ui";
import TestsPanel from "@/components/templates/panels/TestsPanel";
import EditorPanel from "@/components/templates/panels/EditorPanel";
import { useTemplates, useTemplatesLocalStore } from "@/stores/templatesStore";

const TemplateEditor = () => {
  const selectedTemplateID = useTemplatesLocalStore(
    (state) => state.selectedTemplateID,
  );
  const setSelectedTemplateID = useTemplatesLocalStore(
    (state) => state.setSelectedTemplateID,
  );
  const { templates } = useTemplates();

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateID);
  if (!selectedTemplate) {
    const previousTemplate = templates?.find(
      (t) => t.previousID === selectedTemplateID,
    );

    if (previousTemplate && selectedTemplateID) {
      setSelectedTemplateID(previousTemplate.id);
      previousTemplate.previousID = undefined;
    } else {
      return (
        <StyledBox>
          <div className="flex justify-center items-center h-full text-center text-zinc-500">
            <p>Select a template to edit</p>
          </div>
        </StyledBox>
      );
    }
  }

  return (
    <StyledSplitter vertical>
      <EditorPanel />
      <TestsPanel />
    </StyledSplitter>
  );
};

export default TemplateEditor;
