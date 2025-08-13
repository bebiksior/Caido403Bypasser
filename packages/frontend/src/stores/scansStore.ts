import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { type ScanTarget } from "shared";
import { create } from "zustand";

import { useSDKStore } from "@/stores/sdkStore";
import { type FrontendSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";

export const initializeEvents = (
  sdk: FrontendSDK,
  queryClient: QueryClient,
) => {
  sdk.backend.onEvent("scans:created", () => {
    queryClient.invalidateQueries({ queryKey: ["scans"] });
  });

  sdk.backend.onEvent("scans:deleted", (scanID: number) => {
    queryClient.invalidateQueries({ queryKey: ["scans"] });

    const scansLocalStore = useScansLocalStore.getState();
    if (scansLocalStore.selectedScanID === scanID) {
      scansLocalStore.deselectScan();
    }
  });

  sdk.backend.onEvent(
    "scans:updated",
    () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
  );
};

// Calls sdk.backend.getScans()
export const useScans = () => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["scans"],
    queryFn: () => handleBackendCall(sdk.backend.getScans(), sdk),
  });

  return { scans: data, isLoading, isError, error };
};

// Calls sdk.backend.addScan()
export const useAddScan = () => {
  const sdk = useSDKStore.getState().getSDK();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (scanTarget: ScanTarget) =>
      handleBackendCall(sdk.backend.addScan(scanTarget), sdk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
  });

  return { addScan: mutate, isPending, error };
};

// Calls sdk.backend.deleteScan()
export const useDeleteScan = () => {
  const sdk = useSDKStore.getState().getSDK();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (scanID: number) =>
      handleBackendCall(sdk.backend.deleteScan(scanID), sdk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
  });

  return { deleteScan: mutate, isPending, error };
};

// Calls sdk.backend.cancelScan()
export const useCancelScan = () => {
  const sdk = useSDKStore.getState().getSDK();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (scanID: number) =>
      handleBackendCall(sdk.backend.cancelScan(scanID), sdk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
  });

  return { cancelScan: mutate, isPending, error };
};

// Calls sdk.backend.getScan()
export const useScan = (scanID: number) => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["scans", scanID],
    queryFn: () => handleBackendCall(sdk.backend.getScan(scanID), sdk),
  });

  return { scan: data, isLoading, isError, error };
};

// Calls sdk.backend.clearScans() and mutates the scans query
export const useClearScans = () => {
  const sdk = useSDKStore.getState().getSDK();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => handleBackendCall(sdk.backend.clearScans(), sdk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });

      const scansLocalStore = useScansLocalStore.getState();
      scansLocalStore.deselectScan();
    },
  });

  return { clearScans: mutate, isPending, error };
};

export const useScansStore = () => {
  const { scans } = useScans();
  const { selectedScanID, setSelectedScanID } = useScansLocalStore();

  return { scans, selectedScanID, setSelectedScanID };
};

type ScansStore = {
  selectedScanID: number | undefined;
  setSelectedScanID: (selectedScanID: number) => void;
  deselectScan: () => void;
}

export const useScansLocalStore = create<ScansStore>((set) => ({
  selectedScanID: undefined,
  setSelectedScanID: (selectedScanID: number) => set({ selectedScanID }),
  deselectScan: () => set({ selectedScanID: undefined }),
}));
