import { Observable, tap } from "rxjs";
import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { Logger } from "../util/logger";

export abstract class EventProducer<T> {
  abstract produce(): Observable<T>;

  constructor(
    logger: Logger,
    protected readonly options: TraceyOptions & SharedOptions,
  ) {
    if (options.debug) {
      logger.debug(`${this.name} initialized.`);

      this.produce()
        .pipe(tap((e) => logger.debug(this.name, e)))
        .subscribe();
    }
  }

  private get name(): string {
    return this.constructor.name;
  }
}
