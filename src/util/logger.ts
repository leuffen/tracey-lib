import { SharedOptions } from "../config/shared-options";

export class Logger {
  constructor(
    private readonly options?: SharedOptions,
    private readonly prefix = "Tracey",
  ) {}

  debug(message: string, ...args: any[]): void {
    if (this.options?.debug) {
      console.debug(`[${this.prefix}] ${message}`, ...args);
    }
  }
}
