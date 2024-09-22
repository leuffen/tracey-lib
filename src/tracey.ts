import { filter, from, interval, map, merge, switchMap, tap } from "rxjs";
import { defaultDataTransferInterval } from "./config/defaults";
import { SharedOptions } from "./config/shared-options";
import { TraceyOptions } from "./config/tracey-options";
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
  readonly ctorTime = performance.now();
  readonly events: TraceyEvent<unknown>[] = [];

  private readonly logger = new Logger(this.options);
  private readonly breakpointDeterminer = new BreakpointDeterminer(
    this.options,
  );

  private lastSentEventIndex = 0;

  constructor(private readonly options: TraceyOptions & SharedOptions) {
    this.logger.debug("Instance created. Not yet initialized.");
  }

  init(): void {
    this.storeInitEvent();
    this.setupListeners();
    this.setupDataTransfer();
  }

  dump(): void {
    console.log(this.events.map((e) => e.toSerializable()));
  }

  private setupDataTransfer() {
    if (!this.options.dataTransfer) {
      return;
    }

    interval(
      this.options?.dataTransfer?.interval ?? defaultDataTransferInterval,
    )
      .pipe(
        filter(() => document.visibilityState === "visible"),
        map(() => this.events.slice(this.lastSentEventIndex)),
        filter((events) => events.length > 0),
        tap((events) => {
          this.lastSentEventIndex += events.length;
        }),
        switchMap((events) => {
          const promise = fetch(this.options.dataTransfer!.endpoint, {
            method: "POST",
            body: JSON.stringify(events.map((e) => e.toSerializable())),
          });

          return from(promise);
        }),
      )
      .subscribe();
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
