import TemplateResultPreview from "@/components/scans/TemplateResultPreview";
import TemplateResultsList from "@/components/scans/TemplateResultsList";
import StyledBox from "@/components/styled/StyledBox";
import StyledSplitter from "@/components/styled/StyledSplitter";
import { useScansStore } from "@/stores/scansStore";

const ScanPreview = () => {
  const selectedScanID = useScansStore((state) => state.selectedScanID);
  const selectedScan = useScansStore((state) => state.getSelectedScan(state));

  if (selectedScanID === undefined) {
    return (
      <StyledBox>
        <div className="flex justify-center items-center h-full text-center text-zinc-500">
          <p>Select a scan</p>
        </div>
      </StyledBox>
    );
  }

  if (!selectedScan) {
    return (
      <StyledBox>
        <div className="flex justify-center items-center h-full text-center text-zinc-500">
          <p>Scan not found</p>
        </div>
      </StyledBox>
    );
  }

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
