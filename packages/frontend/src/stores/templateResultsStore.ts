import { type QueryClient, useQuery } from "@tanstack/react-query";
import { type TemplateResult } from "shared";
import { create } from "zustand";

import { useScansLocalStore } from "@/stores/scansStore";
import { useSDKStore } from "@/stores/sdkStore";
import { type FrontendSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";

type TemplateResultsLocalStore = {
  selectedTemplateResultID: number | undefined;
  setSelectedTemplateResultID: (selectedTemplateResultID: number) => void;
  deselectTemplateResult: () => void;
}

export const useTemplateResultsLocalStore = create<TemplateResultsLocalStore>(
  (set) => ({
    selectedTemplateResultID: undefined,
    setSelectedTemplateResultID: (selectedTemplateResultID: number) =>
      set({ selectedTemplateResultID }),
    deselectTemplateResult: () => set({ selectedTemplateResultID: undefined }),
  }),
);

export const useTemplateResults = (scanID: number) => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["templateResults", scanID],
    queryFn: () =>
      handleBackendCall(sdk.backend.getTemplateResults(scanID), sdk),
  });

  return { templateResults: data, isLoading, isError, error };
};

export const useTemplateResult = (
  scanID: number | undefined,
  templateResultID: number | undefined,
) => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["templateResult", scanID, templateResultID],
    queryFn: () => {
      if (scanID === undefined || templateResultID === undefined)
        {return Promise.resolve(null);}
      return handleBackendCall(
        sdk.backend.getTemplateResult(scanID, templateResultID),
        sdk,
      );
    },
    enabled: scanID !== undefined && templateResultID !== undefined,
  });

  return { templateResult: data, isLoading, isError, error };
};

export const initializeEvents = (
  sdk: FrontendSDK,
  queryClient: QueryClient,
) => {
  sdk.backend.onEvent("templateResults:created", (scanID, templateResult) => {
    const { selectedScanID } = useScansLocalStore.getState();
    if (scanID !== selectedScanID) {return;}

    queryClient.setQueryData<TemplateResult[]>(
      ["templateResults", scanID],
      (oldData) => {
        if (!oldData) {return [templateResult];}
        return [...oldData, templateResult];
      },
    );
  });

  sdk.backend.onEvent(
    "templateResults:updated",
    (scanID, templateResultID, updatedTemplateResult) => {
      const { selectedScanID } = useScansLocalStore.getState();
      if (scanID !== selectedScanID) {return;}

      queryClient.setQueryData<TemplateResult[]>(
        ["templateResults", scanID],
        (prevData) => {
          if (!prevData) {return prevData;}
          return prevData.map((result) =>
            result.ID === templateResultID
              ? { ...result, ...updatedTemplateResult }
              : result,
          );
        },
      );
    },
  );
};
