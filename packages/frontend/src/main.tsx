import { createRoot } from "react-dom/client";
import App from "./App";
import { runScan } from "@/scan/scan";
import { FrontendSDK } from "@/types/types";
import { initializeSDK } from "@/stores/sdkStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeEvents as initializeScansEvents } from "@/stores/scansStore";
import { initializeEvents as initializeTemplateResultsEvents } from "@/stores/templateResultsStore";
import { initializeEvents as initializeTemplatesEvents } from "@/stores/templatesStore";

const queryClient = new QueryClient();

export const init = (sdk: FrontendSDK) => {
  initializeSDK(sdk);

  initializeScansEvents(sdk, queryClient);
  initializeTemplateResultsEvents(sdk, queryClient);
  initializeTemplatesEvents(sdk, queryClient);

  const rootElement = document.createElement("div");
  Object.assign(rootElement.style, {
    height: "100%",
    width: "100%",
  });
  rootElement.id = "plugin--bypasser";

  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );

  // Add the root element to the SDK navigation page
  sdk.navigation.addPage("/403bypasser", {
    body: rootElement,
  });

  // Register a sidebar item
  const sidebarItem = sdk.sidebar.registerItem("403 Bypasser", "/403bypasser", {
    icon: "fas fa-bug",
  });

  sdk.commands.register("403bypasser-scan", {
    name: "403Bypasser: Scan",
    run: (context) => runScan(sdk, context, sidebarItem.setCount),
  });

  sdk.menu.registerItem({
    type: "Request",
    commandId: "403bypasser-scan",
    leadingIcon: "fas fa-bug",
  });

  sdk.menu.registerItem({
    type: "RequestRow",
    commandId: "403bypasser-scan",
    leadingIcon: "fas fa-bug",
  });
};
