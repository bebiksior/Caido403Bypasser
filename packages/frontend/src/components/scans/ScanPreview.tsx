import { StyledBox, StyledSplitter } from "caido-material-ui";

import { EmptyPage } from "@/components/emptypage/EmptyPage";
import TemplateResultPreview from "@/components/scans/TemplateResultPreview";
import TemplateResultsList from "@/components/scans/TemplateResultsList";
import { useScansLocalStore } from "@/stores/scansStore";

const ScanPreview = () => {
  const selectedScanID = useScansLocalStore((state) => state.selectedScanID);
  if (selectedScanID === undefined) {return EmptyPage("Select a scan");}

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
