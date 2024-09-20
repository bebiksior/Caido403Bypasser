import { useScansStore } from "@/stores/scansStore";
import { useSDKStore } from "@/stores/sdkStore";
import { TemplateResult } from "shared";
import { create } from "zustand";

interface TemplateResultsStore {
  templateResults: TemplateResult[];
  setTemplateResults: (
    templateResults:
      | TemplateResult[]
      | ((prevTemplateResults: TemplateResult[]) => TemplateResult[])
  ) => void;

  selectedTemplateResultID: number | undefined;
  setSelectedTemplateResultID: (selectedTemplateResultID: number) => void;
  getSelectedTemplateResult: (
    state: TemplateResultsStore
  ) => TemplateResult | undefined;
  deselectTemplateResult: () => void;

  initialize: () => Promise<void>;
}

export const useTemplateResultsStore = create<TemplateResultsStore>(
  (set, get) => ({
    templateResults: [],
    setTemplateResults: (
      templateResults:
        | TemplateResult[]
        | ((prevTemplateResults: TemplateResult[]) => TemplateResult[])
    ) =>
      set((state: { templateResults: TemplateResult[] }) => ({
        templateResults:
          typeof templateResults === "function"
            ? templateResults(state.templateResults)
            : templateResults,
      })),
    selectedTemplateResultID: undefined,
    setSelectedTemplateResultID: (selectedTemplateResultID: number) =>
      set({ selectedTemplateResultID }),
    getSelectedTemplateResult: (state: TemplateResultsStore) =>
      state.templateResults.find(
        (templateResult) => templateResult.ID === state.selectedTemplateResultID
      ),
    deselectTemplateResult: () => set({ selectedTemplateResultID: undefined }),

    initialize: async () => {
      const sdk = useSDKStore.getState().getSDK();
      sdk.backend.onEvent(
        "templateResults:created",
        (scanID, templateResult) => {
          const templateResults = get().templateResults;
          const selectedScanID = useScansStore.getState().selectedScanID;
          if (scanID !== selectedScanID) return;

          get().setTemplateResults([...templateResults, templateResult]);
        }
      );

      sdk.backend.onEvent(
        "templateResults:updated",
        (scanID, templateResultID, templateResult) => {
          const templateResults = get().templateResults;
          const selectedScanID = useScansStore.getState().selectedScanID;
          if (scanID !== selectedScanID) return;

          get().setTemplateResults(
            templateResults.map((tr) =>
              tr.ID === templateResultID ? { ...tr, ...templateResult } : tr
            )
          );
        }
      );
    },
  })
);
