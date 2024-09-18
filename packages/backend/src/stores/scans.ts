import { Scan, TemplateResult } from "shared";

export class ScanStore {
  private static instance: ScanStore;

  private scans: Map<number, Scan>;

  private constructor() {
    this.scans = new Map();
  }

  static get(): ScanStore {
    if (!ScanStore.instance) {
      ScanStore.instance = new ScanStore();
    }

    return ScanStore.instance;
  }

  getScans(): Scan[] {
    return [...this.scans.values()];
  }

  getScan(id: number): Scan | undefined {
    return this.scans.get(id);
  }

  addScan(scan: Scan) {
    return this.scans.set(scan.ID, scan);
  }

  deleteScan(id: number): void {
    this.scans.delete(id);
  }

  clearScans(): void {
    this.scans.clear();
  }

  updateScan(id: number, fields: Partial<Scan>): Scan | undefined {
    const scan = this.scans.get(id);
    if (scan) {
      Object.assign(scan, fields);
      return scan;
    }
  }

  addTemplateResult(scanID: number, templateResult: TemplateResult): void {
    const scan = this.scans.get(scanID);
    if (scan) {
      scan.Results.push(templateResult);
    }
  }

  updateTemplateResult(
    scanID: number,
    templateResultID: number,
    fields: Partial<TemplateResult>
  ): void {
    const scan = this.scans.get(scanID);
    if (scan) {
      const templateResult = scan.Results[templateResultID];
      if (templateResult) {
        Object.assign(templateResult, fields);
      }
    }
  }

  clearResults(scanID: number): void {
    const scan = this.scans.get(scanID);
    if (scan) {
      scan.Results = [];
    }
  }
}
