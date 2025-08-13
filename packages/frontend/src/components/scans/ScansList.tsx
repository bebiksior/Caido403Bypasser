import { useState, useMemo } from "react";
import { handleBackendCall } from "@/utils/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TableSortLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import StopIcon from '@mui/icons-material/Stop';
import { Scan } from "shared";
import { useSDKStore } from "@/stores/sdkStore";
import { useDeleteScan, useCancelScan, useScansStore } from "@/stores/scansStore";
import { EmptyPage } from "@/components/emptypage/EmptyPage";
import { useTemplateResultsLocalStore } from "@/stores/templateResultsStore";

type ScansListProps = {
  searchText: string;
}

export const ScansList = ({ searchText }: ScansListProps) => {
  const sdk = useSDKStore.getState().getSDK();

  const { scans, selectedScanID, setSelectedScanID } = useScansStore();
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const { deleteScan } = useDeleteScan();
  const { cancelScan } = useCancelScan();

  const handleSortClick = () => {
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const clickReRunScan = async (scan: Scan) => {
    if (scan.Status === "Running") {return;}
    try {
      await handleBackendCall(sdk.backend.reRunScan(scan.ID), sdk);
      sdk.window.showToast(`Re-running scan ${scan.ID}`);
    } catch (error) {
      sdk.window.showToast(`Failed to re-run scan ${scan.ID}`);
      console.error(error);
    }
  };

  const clickCancelScan = async (scan: Scan) => {
    if (scan.Status !== "Running") {return;}
    try {
      cancelScan(scan.ID);
      sdk.window.showToast(`Cancelled scan ${scan.ID}`);
    } catch (error) {
      sdk.window.showToast(`Failed to cancel scan ${scan.ID}`);
      console.error(error);
    }
  };

  const clickDeleteScan = async (scan: Scan) => {
    if (scan.Status === "Running") {return;}
    try {
      deleteScan(scan.ID);
      sdk.window.showToast(`Deleted scan ${scan.ID}`);
    } catch (error) {
      sdk.window.showToast(`Failed to delete scan ${scan.ID}`);
      console.error(error);
    }
  };

  const filteredScans = useMemo(() => {
    if (!scans) {return [];}
    return scans.filter((scan) =>
      scan.Target.URL.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [scans, searchText]);

  const sortedScans = useMemo(() => {
    return [...filteredScans].sort((a, b) => {
      const dateA = new Date(a.startedAt ?? 0).getTime();
      const dateB = new Date(b.startedAt ?? 0).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [filteredScans, order]);

  const severityMap: Record<
    Scan["Status"],
    "info" | "success" | "warning" | "error"
  > = {
    Running: "info",
    Completed: "success",
    Failed: "error",
    "Timed Out": "warning",
    Cancelled: "error",
  };

  const truncate = (str: string, n: number) =>
    str.length > n ? `${str.substring(0, n - 1)}…` : str;

  if (!scans) {return EmptyPage("No scans found");}

  const selectScan = (scanID: number) => {
    const templateResultsStore = useTemplateResultsLocalStore.getState();
    templateResultsStore.deselectTemplateResult();

    setSelectedScanID(scanID);
  };

  return (
    <TableContainer component={Paper} className="h-full">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={order}
                onClick={handleSortClick}
              >
                Timestamp
              </TableSortLabel>
            </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedScans.map((scan) => (
            <TableRow
              key={scan.ID}
              selected={scan.ID === selectedScanID}
              onClick={() => selectScan(scan.ID)}
              hover
            >
              <TableCell>{scan.startedAt?.toLocaleString()}</TableCell>
              <TableCell>{scan.ID}</TableCell>
              <TableCell>{truncate(scan.Target.URL, 50)}</TableCell>
              <TableCell>
                <Chip
                  label={scan.Status}
                  color={severityMap[scan.Status]}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {scan.Status === "Running" ? (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      clickCancelScan(scan);
                    }}
                    size="small"
                    color="error"
                  >
                    <StopIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      clickReRunScan(scan);
                    }}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                )}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    clickDeleteScan(scan);
                  }}
                  disabled={scan.Status === "Running"}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
