import { useSDKStore } from "@/stores/sdkStore";
import { CaidoSDK } from "@/types/types";
import { handleBackendCall } from "@/utils/utils";
import { Scan } from "shared";

export const useScansRepository = (sdk: CaidoSDK = useSDKStore.getState().getSDK()) => {
  const clearScans = async () => {
    const result = await handleBackendCall(sdk.backend.clearScans(), sdk);
    return result;
  }

  const getScans = async () => {
    const result = await handleBackendCall(sdk.backend.getScans(), sdk);
    return result;
  };

  const getScan = async (id: number) => {
    const result = await handleBackendCall(sdk.backend.getScan(id), sdk);
    return result;
  };

  const addScan = async (scan: any) => {
    const result = await handleBackendCall(sdk.backend.addScan(scan), sdk);
    return result;
  };

  const deleteScan = async (id: number) => {
    const result = await handleBackendCall(sdk.backend.deleteScan(id), sdk);
    return result;
  };

  const updateScan = async (scanID: number, fields: Partial<Scan>) => {
    const result = await handleBackendCall(
      sdk.backend.updateScan(scanID, fields),
      sdk
    );
    return result;
  };

  const runScan = async (id: number) => {
    const result = await handleBackendCall(sdk.backend.runScan(id), sdk);
    return result;
  };

  const reRunScan = async (id: number) => {
    const result = await handleBackendCall(sdk.backend.reRunScan(id), sdk);
    return result;
  };

  const getTemplateResults = async (id: number) => {
    const result = await handleBackendCall(
      sdk.backend.getTemplateResults(id),
      sdk
    );
    return result;
  };

  return {
    getScans,
    getScan,
    addScan,
    deleteScan,
    updateScan,
    runScan,
    reRunScan,
    getTemplateResults,
    clearScans,
  };
};
