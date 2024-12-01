import { useCallback, useState } from "react";
import { baseTemplate } from "@/constants";
import TemplateEditor from "@/components/templates/TemplateEditor";
import TemplateList from "@/components/templates/TemplateList";
import { StyledBox } from "caido-material-ui";
import { StyledSplitter } from "caido-material-ui";
import { Button, Menu, MenuItem } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSDKStore } from "@/stores/sdkStore";
import {
  importTemplate,
  useTemplatesLocalStore,
  useAddTemplate,
  useResetTemplates,
  useClearTemplates,
} from "@/stores/templatesStore";

export default function TemplatesPage() {
  const sdk = useSDKStore.getState().getSDK();

  const setSelectedTemplateID = useTemplatesLocalStore(
    (state) => state.setSelectedTemplateID,
  );
  const { addTemplate } = useAddTemplate();

  const { resetTemplates } = useResetTemplates();
  const { clearTemplates } = useClearTemplates();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onNewClick = useCallback(() => {
    const newTemplate = {
      ...baseTemplate,
      id: `new-template-${Date.now()}`,
    };

    addTemplate(newTemplate);
    setSelectedTemplateID(newTemplate.id);
  }, []);

  const onImportClick = useCallback(() => {
    handleClose();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".yaml";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const raw = await file.text();
      await importTemplate(raw);

      sdk.window.showToast("Template imported", { variant: "success" });
    };
    input.click();
  }, [sdk]);

  const onResetClick = useCallback(() => {
    handleClose();
    resetTemplates();
    sdk.window.showToast("Templates reset", { variant: "success" });
  }, [resetTemplates, sdk]);

  const onClearClick = useCallback(() => {
    handleClose();
    clearTemplates();
    sdk.window.showToast("Templates cleared", { variant: "success" });
  }, [clearTemplates, sdk]);

  return (
    <StyledSplitter>
      {/* Templates */}
      <StyledBox className="flex flex-col">
        <div className="flex justify-between items-center p-5">
          <h1 className="font-bold text-2xl m-0">Templates</h1>
          <div className="flex gap-3">
            <Button
              variant="outlined"
              onClick={handleClick}
              startIcon={<MoreVertIcon />}
            >
              Actions
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={onImportClick}>
                <CloudUploadIcon className="mr-2" /> Import
              </MenuItem>
              <MenuItem onClick={onResetClick}>
                <RestoreIcon className="mr-2" /> Reset
              </MenuItem>
              <MenuItem onClick={onClearClick}>
                <DeleteIcon className="mr-2" /> Clear
              </MenuItem>
            </Menu>
            <Button
              variant="contained"
              onClick={onNewClick}
              className="flex items-center justify-center"
              startIcon={<AddIcon />}
            >
              New
            </Button>
          </div>
        </div>
        <TemplateList />
      </StyledBox>

      {/* Template Editor */}
      <TemplateEditor />
    </StyledSplitter>
  );
}
