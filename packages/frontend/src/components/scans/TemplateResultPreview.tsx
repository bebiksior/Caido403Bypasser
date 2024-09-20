import { HTTPEditor } from "@/components/httpeditor/HTTPEditor";
import StyledBox from "@/components/styled/StyledBox";
import StyledSplitter from "@/components/styled/StyledSplitter";
import { useTemplateResultsStore } from "@/stores/templateResultsStore";

const TemplateResultPreview = () => {
  const selectedTemplateResult = useTemplateResultsStore((state) =>
    state.getSelectedTemplateResult(state)
  );

  if (!selectedTemplateResult) {
    return (
      <StyledBox>
        <div className="flex justify-center items-center h-full text-center text-zinc-500">
          <p>Select a template result</p>
        </div>
      </StyledBox>
    );
  }

  return (
    <StyledSplitter>
      <StyledBox>
        <HTTPEditor
          type="request"
          value={selectedTemplateResult?.SentRawRequest}
        />
      </StyledBox>
      <StyledBox>
        <HTTPEditor
          type="response"
          value={selectedTemplateResult?.Response.RawResponse}
        />
      </StyledBox>
    </StyledSplitter>
  );
};

export default TemplateResultPreview;
