import { create } from "zustand";
import { Scan } from "shared";
import { useSDKStore } from "@/stores/sdkStore";
import { useScansRepository } from "@/repositories/scans";

interface ScansStore {
  scans: Scan[];
  setScans: (scans: Scan[] | ((prevScans: Scan[]) => Scan[])) => void;

  selectedScanID: number | undefined;
  setSelectedScanID: (selectedScanID: number) => void;
  getSelectedScan: (state: ScansStore) => Scan | undefined;

  deselectScan: () => void;
  clearScans: () => void;

  initialize: () => Promise<void>;
}

export const useScansStore = create<ScansStore>((set, get) => ({
  scans: [],
  setScans: (scans: Scan[] | ((prevScans: Scan[]) => Scan[])) =>
    set((state) => ({
      scans: typeof scans === "function" ? scans(state.scans) : scans,
    })),
  selectedScanID: undefined,
  setSelectedScanID: (selectedScanID: number) => set({ selectedScanID }),
  getSelectedScan: (state: ScansStore) =>
    state.scans.find((scan) => scan.ID === state.selectedScanID),
  deselectScan: () => set({ selectedScanID: undefined }),
  clearScans: async () => {
    const { clearScans } = useScansRepository();
    await clearScans();

    get().setScans([]);

    const { deselectScan } = get();
    deselectScan();
  },

  initialize: async () => {
    const sdk = useSDKStore.getState().getSDK();

    sdk.backend.onEvent("scans:created", (scan: Scan) => {
      const scans = get().scans;
      get().setScans([...scans, scan]);
      get().setSelectedScanID(scan.ID);
    });

    sdk.backend.onEvent("scans:deleted", (scanID: number) => {
      const scans = get().scans;
      const selectedScanID = get().selectedScanID;
      if (selectedScanID === scanID) {
        get().deselectScan();
      }
      get().setScans(scans.filter((scan) => scan.ID !== scanID));
    });

    sdk.backend.onEvent("scans:updated", (scanID, scan) => {
      const scans = get().scans;
      get().setScans(
        scans.map((s) => (s.ID === scanID ? { ...s, ...scan } : s))
      );
    });

    const { getScans } = useScansRepository(sdk);
    const scans = await getScans();
    get().setScans(scans);
  },
}));
