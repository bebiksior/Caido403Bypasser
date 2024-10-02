import { Box, Button, InputBase, Typography } from "@mui/material";
import { useState } from "react";
import ScanPreview from "@/components/scans/ScanPreview";
import { ScansList } from "@/components/scans/ScansList";
import { StyledBox } from "caido-material-ui";
import { StyledSplitter } from "caido-material-ui";
import { useClearScans } from "@/stores/scansStore";

export default function Scans() {
  const [searchText, setSearchText] = useState("");
  const { clearScans } = useClearScans();

  return (
    <StyledSplitter defaultSizes={[45, 55]}>
      <StyledBox>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding={2}
        >
          <Typography variant="h4" fontWeight="bold" m={0}>
            Scans
          </Typography>
          <div className="flex items-center space-x-2">
            <Button
              variant="contained"
              color="primary"
              onClick={() => clearScans()}
              size="small"
              sx={{ display: { sm: "none", md: "block" } }}
            >
              Clear All
            </Button>

            <InputBase
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              sx={{
                padding: "4px 8px",
                border: "1px solid lightgray",
                borderRadius: "4px",
              }}
            />
          </div>
        </Box>
        <Box overflow="auto" className="flex flex-col h-full">
          <ScansList searchText={searchText} />
        </Box>
      </StyledBox>
      <StyledBox>
        <ScanPreview />
      </StyledBox>
    </StyledSplitter>
  );
}
