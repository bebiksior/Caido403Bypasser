import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { runScan } from "@/scan/scan";
import { CaidoSDK } from "@/types/types";
import { initializeSDK } from "@/stores/sdkStore";
import { useScansStore } from "@/stores/scansStore";
import { useTemplatesStore } from "@/stores/templatesStore";
import useSettingsStore from "@/stores/settingsStore";
import { useTemplateResultsStore } from "@/stores/templateResultsStore";

export const init = (sdk: CaidoSDK) => {
  initializeSDK(sdk);
  useScansStore.getState().initialize();
  useTemplatesStore.getState().initialize();
  useSettingsStore.getState().initialize();
  useTemplateResultsStore.getState().initialize();

  const rootElement = document.createElement("div");
  Object.assign(rootElement.style, {
    height: "100%",
    width: "100%",
  });

  const root = createRoot(rootElement);
  root.render(<App />);

  // Add the root element to the SDK navigation page
  sdk.navigation.addPage("/403bypasser", {
    body: rootElement,
  });

  // Register a sidebar item
  sdk.sidebar.registerItem("403 Bypasser", "/403bypasser");

  sdk.commands.register("403bypasser-scan", {
    name: "403Bypasser: Scan",
    run: (context) => runScan(sdk, context),
  });

  sdk.menu.registerItem({
    type: "Request",
    commandId: "403bypasser-scan",
  });

  sdk.menu.registerItem({
    type: "RequestRow",
    commandId: "403bypasser-scan",
  });
};
