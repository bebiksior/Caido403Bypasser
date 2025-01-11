import { CaidoSDK } from "@/types/types";
import { getSelectedRequest, handleBackendCall } from "@/utils/utils";
import { CommandContext } from "@caido/sdk-frontend/src/types";

let sidebarCount = 0;
let observer: MutationObserver | null = null;

export const runScan = async (
  sdk: CaidoSDK,
  context: CommandContext,
  setCount: (count: number) => void
) => {
  let currentPath = window.location.hash;
  if (!observer) {
    observer = new MutationObserver(() => {
      const newPath = window.location.hash;
      if (newPath !== currentPath) {
        currentPath = newPath;
        if (currentPath === "#/403bypasser") {
          sidebarCount = 0;
          setCount(sidebarCount);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  const createScanConfig = (request: {
    isTls: boolean;
    host: string;
    port: number;
    raw?: string;
  }) => ({
    URL: `${request.isTls ? "https" : "http"}://${request.host}:${
      request.port
    }`,
    Host: request.host,
    Port: request.port,
    IsTls: request.isTls,
    RawRequest: request.raw ?? "",
  });

  const runSingleScan = async (
    scanConfig: ReturnType<typeof createScanConfig>
  ) => {
    const newScan = await handleBackendCall(
      sdk.backend.addScan(scanConfig),
      sdk
    );
    return handleBackendCall(sdk.backend.runScan(newScan.ID), sdk);
  };

  if (context.type === "RequestContext") {
    const runningScan = await runSingleScan(createScanConfig(context.request));

    sidebarCount += 1;
    setCount(sidebarCount);

    sdk.window.showToast(`Running scan for ${runningScan.Target.Host}`, {
      duration: 3000,
    });
  } else if (context.type === "RequestRowContext") {
    const requests = context.requests.slice(0, 25);

    for (const request of requests) {
      const req = await sdk.graphql.request({ id: request.id });
      if (!req.request?.raw) {
        throw new Error("req.request.raw is null. Please report this bug");
      }

      await runSingleScan(
        createScanConfig({
          ...request,
          raw: req.request.raw,
        })
      );
    }

    sidebarCount += requests.length;
    setCount(sidebarCount);

    sdk.window.showToast(`Running scans for ${requests.length} requests`, {
      duration: 3000,
    });
  } else if (context.type === "BaseContext") {
    const request = getSelectedRequest(sdk);
    if (request) {
      const runningScan = await runSingleScan(
        createScanConfig({
          raw: request.raw,
          host: request.host ?? "",
          port: request.port,
          isTls: request.isTLS,
        })
      );

      sidebarCount += 1;
      setCount(sidebarCount);

      sdk.window.showToast(`Running scan for ${runningScan.Target.Host}`, {
        duration: 3000,
      });
    }
  }
};
