import { tap } from "rxjs";
import { SharedOptions } from "./config/shared-options";
import { TraceyOptions } from "./config/tracey-options";
import { InitEvent } from "./events/init-event";
import { ClickEventProducer } from "./producers/click-event.producer";
import { TraceyEvent } from "./events/tracey-event";
import { ResizeEventProducer } from "./producers/resize-event.producer";
import { BreakpointDeterminer } from "./util/breakpoints";
import { Logger } from "./util/logger";

export class Tracey {
  readonly timeOrigin = performance.timeOrigin;
  readonly ctorTime = performance.now();
  readonly events: TraceyEvent<unknown>[] = [];

  private readonly logger = new Logger(this.options);
  private readonly breakpointDeterminer = new BreakpointDeterminer(
    this.options,
  );

  constructor(private readonly options: TraceyOptions & SharedOptions) {
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
      const producer = new ClickEventProducer(this.logger, this.options);
      producer
        .produce()
        .pipe(tap((e) => this.events.push(e)))
        .subscribe();
    }

    if (!this.options?.disableProducers?.resize) {
      const producer = new ResizeEventProducer(
        this.breakpointDeterminer,
        this.logger,
        this.options,
      );
      producer
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
      screen: {
        breakpoint: this.breakpointDeterminer.getBreakpoint(),
      },
    });
    this.events.push(initEvent);

    this.logger.debug("Tracey initialized. Saved Init Event");
  }
}
