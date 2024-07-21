import { tap } from "rxjs";
import { SharedOptions } from "./config/shared-options";
import { TraceyOptions } from "./config/tracey-options";
import { InitEvent } from "./events/init-event";
import { ClickEventProducer } from "./producers/click-event.producer";
import { TraceyEvent } from "./events/tracey-event";
import { Logger } from "./util/logger";

export class Tracey {
  readonly timeOrigin = performance.timeOrigin;
  readonly ctorTime = performance.now();
  readonly events: TraceyEvent<unknown>[] = [];

  private readonly logger = new Logger(this.options);

  constructor(private readonly options?: TraceyOptions & SharedOptions) {
    this.logger.debug("Instance created. Not yet initialized.");
  }

  init(): void {
    this.storeInitEvent();
    this.setupListeners();
  }

  dump(): void {
    console.log(this.events.map((e) => e.toSerializable()));
  }

  private setupListeners() {
    if (!this.options?.disableProducers?.click) {
      const clickListener = new ClickEventProducer(this.logger, this.options);
      clickListener
        .produce()
        .pipe(tap((e) => this.events.push(e)))
        .subscribe();
    }
  }

  private storeInitEvent() {
    const initEvent = new InitEvent({
      options: this.options,
      timing: {
        origin: this.timeOrigin,
        ctor: this.ctorTime,
        init: performance.now(),
      },
    });
    this.events.push(initEvent);

    this.logger.debug("Tracey initialized. Saved Init Event");
  }
}
