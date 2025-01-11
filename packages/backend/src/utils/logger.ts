import { SDK } from "caido:plugin";
import { ScanError } from "../errors/ScanError";

export class Logger {
  constructor(private sdk: SDK, private context: string) {}

  info(message: string, data?: unknown): void {
    this.log('INFO', message, data);
  }

  error(error: unknown, context?: string): void {
    if (error instanceof ScanError) {
      this.log('ERROR', `[${error.code}] ${error.message}`, {
        details: error.details,
        context,
      });
    } else if (error instanceof Error) {
      this.log('ERROR', error.message, {
        stack: error.stack,
        context,
      });
    } else {
      this.log('ERROR', 'Unknown error occurred', {
        error,
        context,
      });
    }
  }

  private log(level: string, message: string, data?: unknown): void {
    const logMessage = `[${level}] [${this.context}] ${message}`;

    if (data) {
      this.sdk.console.log(`${logMessage} ${JSON.stringify(data, null, 2)}`);
    } else {
      this.sdk.console.log(logMessage);
    }
  }
}
