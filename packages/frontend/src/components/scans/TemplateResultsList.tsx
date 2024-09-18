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
import { useScansStore } from "@/stores/scansStore";
import { useTemplateResultsStore } from "@/stores/templateResultsStore";

interface TemplateResult {
  ID: string;
  Response: {
    StatusCode: number;
    ContentLength: number;
  };
  TemplateID: string;
  State: string;
}

type OrderBy =
  | keyof TemplateResult
  | "Response.StatusCode"
  | "Response.ContentLength";

const TemplateResultsList: React.FC = () => {
  const {
    templateResults,
    selectedTemplateResultID,
    setSelectedTemplateResultID,
    deselectTemplateResult,
  } = useTemplateResultsStore();
  const selectedScanID = useScansStore((state) => state.selectedScanID);

  const getColorForStatusCode = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "success";
    if (statusCode >= 300 && statusCode < 400) return "warning";
    return "error";
  };

  useEffect(() => {
    deselectTemplateResult();
  }, [selectedScanID, setSelectedTemplateResultID]);

  const [orderBy, setOrderBy] = useState<OrderBy>("ID");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedResults = useMemo(() => {
    return [...templateResults].sort((a, b) => {
      let aValue: any, bValue: any;

      if (orderBy === "Response.StatusCode") {
        aValue = a.Response.StatusCode;
        bValue = b.Response.StatusCode;
      } else if (orderBy === "Response.ContentLength") {
        aValue = a.Response.ContentLength;
        bValue = b.Response.ContentLength;
      } else {
        aValue = a[orderBy];
        bValue = b[orderBy];
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [templateResults, orderBy, order]);

  return (
    <TableContainer component={Paper} sx={{ height: "100%", overflow: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {[
              { id: "ID", label: "ID" },
              { id: "Response.StatusCode", label: "Status Code" },
              { id: "Response.ContentLength", label: "Content Length" },
              { id: "TemplateID", label: "Template ID" },
              { id: "State", label: "State" },
            ].map((column) => (
              <TableCell key={column.id}>
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : "asc"}
                  onClick={() => handleRequestSort(column.id as OrderBy)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedResults.map((result) => (
            <TableRow
              key={result.ID}
              selected={result.ID === selectedTemplateResultID}
              onClick={() => setSelectedTemplateResultID(result.ID)}
              hover
            >
              <TableCell>{result.ID}</TableCell>
              <TableCell>
                {result.Response.StatusCode && (
                  <Chip
                    label={result.Response.StatusCode}
                    color={getColorForStatusCode(result.Response.StatusCode)}
                    size="small"
                  />
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
