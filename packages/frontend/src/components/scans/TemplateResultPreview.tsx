import React from "react";
import { EmptyPage } from "@/components/emptypage/EmptyPage";
import { HTTPEditor } from "@/components/httpeditor/HTTPEditor";
import { useScansLocalStore } from "@/stores/scansStore";
import {
  useTemplateResult,
  useTemplateResultsLocalStore,
} from "@/stores/templateResultsStore";
import { StyledBox, StyledSplitter } from "caido-material-ui";

const TemplateResultPreview = () => {
  const selectedScanID = useScansLocalStore((state) => state.selectedScanID);
  const selectedTemplateResultID = useTemplateResultsLocalStore(
    (state) => state.selectedTemplateResultID
  );

  const { templateResult } = useTemplateResult(
    selectedScanID,
    selectedTemplateResultID
  );

  if (!selectedScanID) return EmptyPage("No scan selected");
  if (!selectedTemplateResultID)
    return EmptyPage("No template result selected");

  return (
    <StyledSplitter>
      <StyledBox>
        <HTTPEditor type="request" value={templateResult?.SentRawRequest || ""} />
      </StyledBox>
      <StyledBox>
        <HTTPEditor
          type="response"
          value={templateResult?.Response.RawResponse || ""}
        />
      </StyledBox>
    </StyledSplitter>
  );
};

export default TemplateResultPreview;
