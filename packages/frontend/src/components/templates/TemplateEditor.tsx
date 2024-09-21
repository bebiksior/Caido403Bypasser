import React from "react";
import StyledBox from "@/components/styled/StyledBox";
import StyledSplitter from "@/components/styled/StyledSplitter";
import TestsPanel from "@/components/templates/panels/TestsPanel";
import TopPanel from "@/components/templates/panels/TopPanel";
import { useTemplatesStore } from "@/stores/templatesStore";

const TemplateEditor = () => {
  const templates = useTemplatesStore((state) => state.templates);
  const selectedTemplateID = useTemplatesStore((state) => state.selectedTemplateID);
  const setSelectedTemplateID = useTemplatesStore((state) => state.setSelectedTemplateID);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateID);
  if (!selectedTemplate) {
    const previousTemplate = templates.find(
      (t) => t.previousID === selectedTemplateID
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
      <TopPanel />
      <TestsPanel />
    </StyledSplitter>
  );
};

export default TemplateEditor;
