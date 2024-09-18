import { CaidoSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";
import { CommandContext } from "@caido/sdk-frontend/src/types";

export const runScan = async (sdk: CaidoSDK, context: CommandContext) => {
  if (context.type === "RequestContext") {
    const { request } = context;
    const protocol = request.isTls ? "https" : "http";
    const connectionURL = `${protocol}://${request.host}:${request.port}`;

    const newScan = await handleBackendCall(
      sdk.backend.addScan({
        URL: connectionURL,
        Host: request.host,
        Port: request.port,
        IsTls: request.isTls,
        RawRequest: request.raw,
      }),
      sdk
    );

    const runningScan = await handleBackendCall(
      sdk.backend.runScan(newScan.ID),
      sdk
    );

    sdk.window.showToast(`Running scan for ${runningScan.Target.Host}`, {
      duration: 3000,
    });

    sdk.navigation.goTo("/403bypasser");
  }
};
