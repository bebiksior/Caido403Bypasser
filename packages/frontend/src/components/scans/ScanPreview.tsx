import TemplateResultPreview from "@/components/scans/TemplateResultPreview";
import TemplateResultsList from "@/components/scans/TemplateResultsList";
import { StyledBox } from "caido-material-ui";
import { useScansLocalStore } from "@/stores/scansStore";
import { StyledSplitter } from "caido-material-ui";
import { EmptyPage } from "@/components/emptypage/EmptyPage";

const ScanPreview = () => {
  const selectedScanID = useScansLocalStore((state) => state.selectedScanID);
  if (selectedScanID === undefined) return EmptyPage("Select a scan");

  return (
    <StyledSplitter vertical key={selectedScanID}>
      <StyledBox>
        <TemplateResultsList />
      </StyledBox>
      <TemplateResultPreview />
    </StyledSplitter>
  );
};

export default ScanPreview;
