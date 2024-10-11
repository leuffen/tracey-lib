import { merge, tap } from "rxjs";
import { SharedOptions } from "./config/shared-options";
import { TraceyOptions } from "./config/tracey-options";
import { DataTransferService } from "./data-transfer/data-transfer-service";
import { InitEvent } from "./events/init-event";
import { TraceyEvent } from "./events/tracey-event";
import { ClickEventProducer } from "./producers/click-event.producer";
import { IntersectionEventProducer } from "./producers/intersection-event.producer";
import { MouseMoveEventProducer } from "./producers/mouse-move-event.producer";
import { ResizeEventProducer } from "./producers/resize-event.producer";
import { ScrollEndEventProducer } from "./producers/scroll-end-event.producer";
import { ScrollEventProducer } from "./producers/scroll-event.producer";
import { VisibilityStateEventProducer } from "./producers/visibility-state-event.producer";
import { BreakpointDeterminer } from "./util/breakpoints";
import { Logger } from "./util/logger";

export class Tracey {
  readonly visitId = this.options?.visitId?.disabled
    ? undefined
    : window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  readonly ctorTime = performance.now();
  readonly events: TraceyEvent<unknown>[] = [];

  private readonly dataTransferService = new DataTransferService(
    this,
    this.options,
  );
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
    this.dataTransferService.init();
  }

  private setupListeners() {
    merge(
      new MouseMoveEventProducer(this.logger, this.options).produce(),
      new ClickEventProducer(this.logger, this.options).produce(),
      new ResizeEventProducer(
        this.breakpointDeterminer,
        this.logger,
        this.options,
      ).produce(),
      new ScrollEventProducer(this.logger, this.options).produce(),
      new ScrollEndEventProducer(this.logger, this.options).produce(),
      new VisibilityStateEventProducer(this.logger, this.options).produce(),
      new IntersectionEventProducer(this.logger, this.options).produce(),
    )
      .pipe(tap((e) => this.events.push(e)))
      .subscribe();
  }

  private storeInitEvent() {
    const initEvent = new InitEvent({
      options: this.options,
      timing: {
        origin: performance.timeOrigin,
        ctor: this.ctorTime,
        init: performance.now(),
      },
      screen: {
        breakpointHorizontal:
          this.breakpointDeterminer.getHorizontalBreakpoint(),
        breakpointVertical: this.breakpointDeterminer.getVerticalBreakpoint(),
      },
    });
    this.events.push(initEvent);

    this.logger.debug("Tracey initialized. Saved Init Event");
  }
}
