import { CaidoSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";
import { CommandContext } from "@caido/sdk-frontend/src/types";

let sidebarCount = 0;
export const runScan = async (sdk: CaidoSDK, context: CommandContext, setCount: (count: number) => void) => {
  const createScanConfig = (request: {
    isTls: boolean;
    host: string;
    port: number;
    raw?: string;
  }) => ({
    URL: `${request.isTls ? "https" : "http"}://${request.host}:${request.port}`,
    Host: request.host,
    Port: request.port,
    IsTls: request.isTls,
    RawRequest: request.raw ?? "",
  });

  const runSingleScan = async (
    scanConfig: ReturnType<typeof createScanConfig>,
  ) => {
    const newScan = await handleBackendCall(
      sdk.backend.addScan(scanConfig),
      sdk,
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
        }),
      );
    }

    sidebarCount += requests.length;
    setCount(sidebarCount);

    sdk.window.showToast(`Running scans for ${requests.length} requests`, {
      duration: 3000,
    });
  }
};
