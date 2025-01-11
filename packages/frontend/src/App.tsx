import React, { useEffect, useState } from "react";
import Scans from "@/pages/Scans";
import SettingsPage from "@/pages/Settings";
import TemplatesPage from "@/pages/Templates";
import "@/styles/style.css";
import {
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
} from "@mui/material";
import { themeOptions } from "@/theme";
import SettingsIcon from "@mui/icons-material/Settings";
import RadarIcon from "@mui/icons-material/Radar";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import "allotment/dist/style.css";
import { useSDKStore } from "@/stores/sdkStore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorIcon from "@mui/icons-material/Error";

export default function App() {
  const [activeComponent, setActiveComponent] = useState("Scans");
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const sdk = useSDKStore((state) => state.getSDK());

  useEffect(() => {
    const errorEvent = sdk.backend.onEvent(
      "scans:error",
      (scanID: number, message: string) => {
        setErrorDialog({ open: true, message });
      },
    );

    const updatesEvent = sdk.backend.onEvent("plugin:outdated", () => {
      sdk.window.showToast("403Bypasser: Plugin is outdated", {
        variant: "warning",
        duration: 4000,
      });
    });

    return () => {
      errorEvent.stop();
      updatesEvent.stop();
    };
  }, [sdk]);

  const handleCloseError = () => {
    setErrorDialog({ open: false, message: "" });
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "Scans":
        return <Scans />;
      case "Templates":
        return <TemplatesPage />;
      case "Settings":
        return <SettingsPage />;
    }
  };

  const theme = createTheme(themeOptions);

  return (
    <ThemeProvider theme={theme}>
      <div className="h-full flex flex-col gap-1">
        {/* Header */}
        <div className="bg-[var(--c-bg-subtle)]">
          <Tabs
            value={activeComponent}
            onChange={(event, newValue) => setActiveComponent(newValue)}
          >
            <Tab
              value="Scans"
              iconPosition="start"
              label="Scans"
              icon={<RadarIcon />}
            />
            <Tab
              value="Templates"
              iconPosition="start"
              label="Templates"
              icon={<InsertDriveFileIcon />}
            />
            <Tab
              value="Settings"
              iconPosition="start"
              label="Settings"
              icon={<SettingsIcon />}
            />
          </Tabs>
        </div>

        {/* Main content */}
        {renderComponent()}

        <Dialog
          open={errorDialog.open}
          onClose={handleCloseError}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center">
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              403Bypasser: Error
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                multiline
                fullWidth
                variant="outlined"
                value={errorDialog.message}
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    backgroundColor: "action.hover",
                  },
                }}
                minRows={4}
                maxRows={12}
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(errorDialog.message);
                  }}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Copy to Clipboard
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseError} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}
