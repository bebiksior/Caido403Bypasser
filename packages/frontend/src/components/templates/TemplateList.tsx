import React, { useCallback } from "react";
import { useSDKStore } from "@/stores/sdkStore";
import { handleBackendCall } from "@/utils/utils";
import { Template } from "shared";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  removeTempTemplate,
  useTemplates,
  useTemplatesLocalStore,
} from "@/stores/templatesStore";

const MAX_DESCRIPTION_LENGTH = 45;

const TemplateList = () => {
  const sdk = useSDKStore.getState().getSDK();

  const { selectedTemplateID, setSelectedTemplateID, deselectTemplate } =
    useTemplatesLocalStore();
  const { templates } = useTemplates();
  const onTemplateToggle = useCallback(
    async (template: Template) => {
      const updatedTemplate = { ...template, enabled: !template.enabled };
      await handleBackendCall(
        sdk.backend.saveTemplate(updatedTemplate.id, updatedTemplate),
        sdk
      );
    },
    [sdk]
  );

  const onRemoveClick = useCallback(
    async (e: React.MouseEvent, template: Template) => {
      e.stopPropagation();

      if (template.isNew) {
        await removeTempTemplate(template.id);
      } else {
        await handleBackendCall(sdk.backend.removeTemplate(template.id), sdk);
      }

      if (selectedTemplateID === template.id) {
        deselectTemplate();
      }

      sdk.window.showToast(`Deleted template ${template.id}`, {
        variant: "success",
      });
    },
    [sdk, selectedTemplateID, deselectTemplate]
  );

  const exportTemplate = useCallback(
    async (e: React.MouseEvent, template: Template) => {
      e.stopPropagation();
      const data = await handleBackendCall(
        sdk.backend.exportTemplate(template.id),
        sdk
      );
      const blob = new Blob([data], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.id}.yaml`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [sdk]
  );

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
    >
      <Table stickyHeader className="h-full">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox"></TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2">
                  Import or create a new template
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            templates?.map((template) => (
              <TableRow
                key={template.id}
                selected={template.id === selectedTemplateID}
                onClick={() => setSelectedTemplateID(template.id)}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={template.enabled}
                    onChange={() => onTemplateToggle(template)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>{template.id}</TableCell>
                <TableCell>
                  {template.description &&
                  template.description.length > MAX_DESCRIPTION_LENGTH
                    ? template.description.substring(
                        0,
                        MAX_DESCRIPTION_LENGTH
                      ) + "..."
                    : template.description}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => exportTemplate(e, template)}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => onRemoveClick(e, template)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TemplateList;
