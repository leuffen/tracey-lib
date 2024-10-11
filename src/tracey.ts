import { merge, Observable, tap } from "rxjs";
import { Analysis } from "./analytics/analysis";
import { SharedOptions } from "./config/shared-options";
import { TraceyOptions } from "./config/tracey-options";
import { DataTransferService } from "./data-transfer/data-transfer-service";
import { downloadTrace } from "./data-transfer/download-trace";
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
import { TraceyError, TraceyErrorCode } from "./util/error";
import { Logger } from "./util/logger";
import { Modes } from "./util/modes";
import { QueryParams } from "./util/query-params";
import { visualizeEvents } from "./visualization/visualize-events";

export class Tracey {
  readonly mode: Modes = Modes.CAPTURE;
  readonly visitId = this.options?.visitId?.disabled
    ? undefined
    : window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  readonly ctorTime = performance.now();
  eventStream$?: Observable<TraceyEvent<unknown>>;
  readonly events: TraceyEvent<unknown>[] = [];
  readonly analyses: Analysis<any>[] = [];

  private readonly dataTransferService = new DataTransferService(
    this,
    this.options,
  );
  private readonly logger = new Logger(this.options);
  private readonly breakpointDeterminer = new BreakpointDeterminer(
    this.options,
  );

  constructor(private readonly options: TraceyOptions & SharedOptions) {
    const url = new URL(window.location.href);
    if (url.searchParams.has(QueryParams.REPLAY_VISIT_ID)) {
      this.mode = Modes.VISUALIZE;
    }

    this.logger.debug(
      `Instance created in ${this.mode} mode. Not yet initialized.`,
    );
  }

  init(): void {
    switch (this.mode) {
      case Modes.CAPTURE:
        this.initCaptureMode();
        break;
      case Modes.VISUALIZE:
        this.initVisualizeMode();
        break;
      default:
        throw new TraceyError(
          TraceyErrorCode.NOT_IMPLEMENTED,
          `Mode ${this.mode} not implemented`,
        );
    }
  }

  /**
   * Starts all analysis instances that have not been started yet.
   */
  startAnalyses(): void {
    this.analyses.forEach((a) => {
      try {
        a.start();
      } catch (e) {
        if (
          e instanceof TraceyError &&
          e.code === TraceyErrorCode.ANALYSIS_ALREADY_STARTED
        ) {
          // can be safely ignored
          return;
        }

        throw e;
      }
    });
  }

  /**
   * Stops all analysis instances that have not been stopped yet.
   */
  stopAnalyses(): any[] {
    return this.analyses.map((a) => {
      try {
        return a.stop();
      } catch (e) {
        if (
          e instanceof TraceyError &&
          e.code === TraceyErrorCode.ANALYSIS_ALREADY_STOPPED
        ) {
          // can be safely ignored
          return;
        }

        throw e;
      }
    });
  }

  private async initVisualizeMode() {
    this.assertMode(Modes.VISUALIZE);
    const url = new URL(window.location.href);
    const visitId = url.searchParams.get(QueryParams.REPLAY_VISIT_ID);

    if (!visitId) {
      throw new TraceyError(
        TraceyErrorCode.INVALID_CONFIGURATION,
        `${this.mode} mode started, but ${QueryParams.REPLAY_VISIT_ID} query param is missing`,
      );
    }

    const events = await downloadTrace(visitId, this.options);
    visualizeEvents(events);
  }

  private initCaptureMode() {
    this.assertMode(Modes.CAPTURE);
    this.storeInitEvent();
    this.setupListeners();
    this.dataTransferService.init();
  }

  private setupListeners() {
    this.eventStream$ = merge(
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
    ).pipe(tap((e) => this.events.push(e)));

    this.eventStream$.subscribe();
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

  private assertMode(mode: Modes): void {
    if (this.mode !== mode) {
      throw new TraceyError(
        TraceyErrorCode.MODE_MISMATCH,
        `Invalid mode. Expected ${mode}, got ${this.mode}`,
      );
    }
  }
}
