import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TableSortLabel,
} from "@mui/material";
import { useScansLocalStore } from "@/stores/scansStore";
import {
  useTemplateResults,
  useTemplateResultsLocalStore,
} from "@/stores/templateResultsStore";
import { EmptyPage } from "@/components/emptypage/EmptyPage";

type SortField = "ID" | "StatusCode" | "ContentLength" | "TemplateID" | "State";
type SortOrder = "asc" | "desc" | null;

const TemplateResultsList = () => {
  console.log("Rendering TemplateResultsList");

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const {
    selectedTemplateResultID,
    setSelectedTemplateResultID,
    deselectTemplateResult,
  } = useTemplateResultsLocalStore();

  const selectedScanID = useScansLocalStore((state) => state.selectedScanID);

  const { templateResults, isLoading, isError, error } = useTemplateResults(
    selectedScanID || 0
  );

  useEffect(() => {
    deselectTemplateResult();
  }, [selectedScanID, deselectTemplateResult]);

  const getColorForStatusCode = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "success";
    if (statusCode >= 300 && statusCode < 400) return "warning";
    return "error";
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortField(null);
        setSortOrder(null);
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTemplateResults = useMemo(() => {
    if (!templateResults || !sortField || !sortOrder) return templateResults;
    return [...templateResults].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "ID":
          comparison = a.ID - b.ID;
          break;
        case "StatusCode":
          comparison =
            (a.Response.StatusCode || 0) - (b.Response.StatusCode || 0);
          break;
        case "ContentLength":
          comparison =
            (a.Response.ContentLength || 0) - (b.Response.ContentLength || 0);
          break;
        case "TemplateID":
          comparison = a.TemplateID.localeCompare(b.TemplateID);
          break;
        case "State":
          comparison = a.State.localeCompare(b.State);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [templateResults, sortField, sortOrder]);

  if (!selectedScanID) return EmptyPage("No scan selected");
  if (isLoading) return EmptyPage("Loading template results...");
  if (isError) return EmptyPage(`Error loading template results: ${error}`);
  if (!templateResults || templateResults.length === 0)
    return EmptyPage("No template results found");

  return (
    <TableContainer component={Paper} sx={{ height: "100%", overflow: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortField === "ID"}
                direction={
                  sortField === "ID" ? sortOrder || undefined : undefined
                }
                onClick={() => handleSort("ID")}
              >
                ID
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "StatusCode"}
                direction={
                  sortField === "StatusCode"
                    ? sortOrder || undefined
                    : undefined
                }
                onClick={() => handleSort("StatusCode")}
              >
                Status Code
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "ContentLength"}
                direction={
                  sortField === "ContentLength"
                    ? sortOrder || undefined
                    : undefined
                }
                onClick={() => handleSort("ContentLength")}
              >
                Content Length
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "TemplateID"}
                direction={
                  sortField === "TemplateID"
                    ? sortOrder || undefined
                    : undefined
                }
                onClick={() => handleSort("TemplateID")}
              >
                Template ID
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "State"}
                direction={
                  sortField === "State" ? sortOrder || undefined : undefined
                }
                onClick={() => handleSort("State")}
              >
                State
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTemplateResults?.map((result) => (
            <TableRow
              key={result.ID}
              selected={result.ID === selectedTemplateResultID}
              onClick={() => setSelectedTemplateResultID(result.ID)}
              hover
            >
              <TableCell>{result.ID}</TableCell>
              <TableCell>
                {result.Response.StatusCode ? (
                  <Chip
                    label={result.Response.StatusCode || ""}
                    color={getColorForStatusCode(result.Response.StatusCode)}
                    size="small"
                  />
                ) : (
                  ""
                )}
              </TableCell>
              <TableCell>{result.Response.ContentLength || ""}</TableCell>
              <TableCell>{result.TemplateID}</TableCell>
              <TableCell>
                <Chip
                  label={result.State}
                  color={result.State === "Success" ? "success" : "warning"}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TemplateResultsList;
