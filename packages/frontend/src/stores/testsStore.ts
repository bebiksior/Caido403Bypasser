import { defaultTest } from "@/constants";
import { create } from "zustand";

interface TestStore {
  testContent: string;
  testResults: string[];
  setTestContent: (content: string) => void;
  setTestResults: (results: string[]) => void;
  addTestResult: (result: string) => void;
}

const useTestStore = create<TestStore>((set) => ({
  testContent: defaultTest,
  testResults: [],
  setTestContent: (content: string) =>
    set(() => ({ testContent: content })),
  setTestResults: (results: string[]) =>
    set(() => ({ testResults: results })),
  addTestResult: (result: string) =>
    set((state) => ({ testResults: [...state.testResults, result] })),
}));

export default useTestStore;