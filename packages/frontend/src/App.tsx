import React, { useEffect, useState } from "react";
import Scans from "@/pages/Scans";
import SettingsPage from "@/pages/Settings";
import TemplatesPage from "@/pages/Templates";
import "@/styles/style.css";
import { Tab, Tabs, ThemeProvider, createTheme } from "@mui/material";
import { themeOptions } from "@/theme";
import SettingsIcon from "@mui/icons-material/Settings";
import RadarIcon from "@mui/icons-material/Radar";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import "allotment/dist/style.css";

export default function App() {
  const [activeComponent, setActiveComponent] = useState("Scans");

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
      </div>
    </ThemeProvider>
  );
}
