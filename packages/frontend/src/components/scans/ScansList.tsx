import React, { useState, useMemo } from "react";
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
import { Scan } from "shared";
import { useSDKStore } from "@/stores/sdkStore";
import { useDeleteScan, useScansStore } from "@/stores/scansStore";
import { EmptyPage } from "@/components/emptypage/EmptyPage";
import { useTemplateResultsLocalStore } from "@/stores/templateResultsStore";

interface ScansListProps {
  searchText: string;
}

export const ScansList = ({ searchText }: ScansListProps) => {
  const sdk = useSDKStore.getState().getSDK();

  const { scans, selectedScanID, setSelectedScanID } = useScansStore();
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const { deleteScan } = useDeleteScan();

  const handleSortClick = () => {
    setOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const clickReRunScan = async (scan: Scan) => {
    if (scan.State === "Running") return;
    try {
      await handleBackendCall(sdk.backend.reRunScan(scan.ID), sdk);
      sdk.window.showToast(`Re-running scan ${scan.ID}`);
    } catch (error) {
      sdk.window.showToast(`Failed to re-run scan ${scan.ID}`);
      console.error(error);
    }
  };

  const clickDeleteScan = async (scan: Scan) => {
    if (scan.State === "Running") return;
    try {
      deleteScan(scan.ID);
      sdk.window.showToast(`Deleted scan ${scan.ID}`);
    } catch (error) {
      sdk.window.showToast(`Failed to delete scan ${scan.ID}`);
      console.error(error);
    }
  };

  const filteredScans = useMemo(() => {
    if (!scans) return [];
    return scans.filter((scan) =>
      scan.Target.URL.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [scans, searchText]);

  const sortedScans = useMemo(() => {
    return [...filteredScans].sort((a, b) => {
      const dateA = new Date(a.startedAt || 0).getTime();
      const dateB = new Date(b.startedAt || 0).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [filteredScans, order]);

  const severityMap: Record<
    Scan["State"],
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

  if (!scans) return EmptyPage("No scans found");

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
                  label={scan.State}
                  color={severityMap[scan.State]}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    clickReRunScan(scan);
                  }}
                  disabled={scan.State === "Running"}
                  size="small"
                >
                  <RefreshIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    clickDeleteScan(scan);
                  }}
                  disabled={scan.State === "Running"}
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
