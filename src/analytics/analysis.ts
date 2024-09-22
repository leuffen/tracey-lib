import {
  fromEvent,
  iif,
  interval,
  merge,
  Observable,
  of,
  shareReplay,
  Subscription,
  tap,
} from "rxjs";
import {
  AnalysisOptions,
  VisualizerPosition,
} from "../config/analysis-options";
import { defaultVisualizerInterval } from "../config/defaults";
import { SharedOptions } from "../config/shared-options";
import { TraceyEvent } from "../events/tracey-event";
import { Tracey } from "../tracey";
import { TraceyAttributeNames } from "../util/attributes";
import { TraceyError, TraceyErrorCode } from "../util/error";
import { KeyValuePair } from "../util/key-value-pair";
import { Logger } from "../util/logger";
import { ElementStatsVisualizer } from "../visualization/element-stats-visualizer";
import { ElementStatsVisualizerStack } from "../visualization/element-stats-visualizer-stack";

export interface AnalysisResult {
  timing: {
    start: DOMHighResTimeStamp;
    end: DOMHighResTimeStamp;
  };
}

export abstract class Analysis<R extends AnalysisResult> {
  private started = false;
  private stopped = false;

  private visualizerStack?: ElementStatsVisualizerStack;
  private visualizer?: ElementStatsVisualizer;
  private visualizerSubscription?: Subscription;
  private visualizerPositioningSubscription?: Subscription;

  protected readonly logger = new Logger(this.options, this.name);
  protected subscription?: Subscription;
  protected startTime?: DOMHighResTimeStamp;
  protected endTime?: DOMHighResTimeStamp;

  protected abstract getVisualizerData(): KeyValuePair[];

  protected abstract getResult(): R;
  protected abstract observe(
    eventStream$: Observable<TraceyEvent<unknown>>,
  ): Observable<unknown>;

  protected constructor(
    protected readonly name: string,
    protected readonly supportedPositions: VisualizerPosition[],
    protected readonly tracey: Tracey,
    protected readonly options?: SharedOptions & AnalysisOptions,
  ) {
    this.tracey.analyses.push(this);
  }

  protected getBaseResult(): AnalysisResult {
    return {
      timing: {
        start: this.startTime!,
        end: this.endTime!,
      },
    };
  }

  start(): void {
    if (this.started) {
      throw new TraceyError(TraceyErrorCode.ANALYSIS_ALREADY_STARTED);
    }

    if (!this.tracey.eventStream$) {
      throw new TraceyError(
        TraceyErrorCode.TRACEY_NOT_INITIALIZED,
        "Can not start analysis. Event stream not initialized.",
      );
    }

    const stream$ = this.observe(this.tracey.eventStream$).pipe(shareReplay(1));

    if (this.shouldVisualize) {
      this.setupVisualizerStack();
      this.visualizer = this.setupVisualizer();
      this.setupVisualizerPositioning();

      this.visualizerSubscription = merge(
        stream$,
        iif(
          () => this.visualizerInterval > 0,
          interval(this.visualizerInterval),
          of(null),
        ),
      )
        .pipe(
          tap(() => {
            if (this.visualizer) {
              this.visualizer.data = this.getVisualizerData();
            }
          }),
        )
        .subscribe();
    }

    this.startTime = performance.now();
    this.subscription = stream$.subscribe();
    this.started = true;
  }

  stop(): R {
    if (!this.started) {
      throw new TraceyError(TraceyErrorCode.ANALYSIS_NOT_STARTED);
    }
    if (this.stopped) {
      throw new TraceyError(TraceyErrorCode.ANALYSIS_ALREADY_STOPPED);
    }
    this.stopped = true;

    this.endTime = performance.now();
    this.subscription?.unsubscribe();
    this.visualizerSubscription?.unsubscribe();
    this.visualizerPositioningSubscription?.unsubscribe();
    return this.getResult();
  }

  private get shouldVisualize(): boolean {
    if (typeof this.options?.visualize === "boolean") {
      return this.options.visualize;
    }

    return this.options?.visualize?.enabled ?? false;
  }

  private get visualizerInterval(): number {
    if (typeof this.options?.visualize === "boolean") {
      return defaultVisualizerInterval;
    }

    return this.options?.visualize?.interval ?? defaultVisualizerInterval;
  }

  private get visualizerPosition(): VisualizerPosition {
    if (typeof this.options?.visualize === "boolean") {
      return VisualizerPosition.Global;
    }

    const position =
      this.options?.visualize?.position ?? VisualizerPosition.Global;
    return this.supportedPositions.includes(position)
      ? position
      : VisualizerPosition.Global;
  }

  protected getObservedElement(): Element {
    throw new TraceyError(
      TraceyErrorCode.NOT_IMPLEMENTED,
      `Configuration of this ${this.name} led to getObservedElement() being called, but this method is not implemented. Make sure the concrete analysis class implements this method.`,
    );
  }

  protected setupVisualizer(): ElementStatsVisualizer {
    const tag = ElementStatsVisualizer.define();
    const el = document.createElement(tag) as ElementStatsVisualizer;
    el.setAttribute(TraceyAttributeNames.DATA_LABEL, this.name);

    return el;
  }

  private setupVisualizerStack(): void {
    if (this.visualizerStack) {
      return;
    }

    const tag = ElementStatsVisualizerStack.define();
    const existing = document.querySelector<ElementStatsVisualizerStack>(tag);
    if (existing) {
      this.visualizerStack = existing;
      return;
    }

    const stack = document.createElement(tag) as ElementStatsVisualizerStack;
    document.body.appendChild(stack);
    this.visualizerStack = stack;
  }

  private setupVisualizerPositioning(): void {
    if (!this.visualizer) {
      throw new Error(
        "Visualizer not setup! This method should only be called after the visualizer has been created.",
      );
    }

    switch (this.visualizerPosition) {
      case VisualizerPosition.Global:
        this.visualizerStack!.addVisualizer(this.visualizer);
        break;
      case VisualizerPosition.Element:
        const el = this.getObservedElement();
        if (!el) {
          throw new TraceyError(
            TraceyErrorCode.MISSING_OBSERVED_ELEMENT,
            "getObservedElement() must return an element!",
          );
        }
        this.visualizer.style.position = "absolute";

        this.visualizerPositioningSubscription = merge(
          fromEvent(window, "scroll"),
          fromEvent(window, "resize"),
        )
          .pipe(
            tap(() => {
              const rect = el.getBoundingClientRect();
              this.visualizer!.style.top = `${rect.top + window.scrollY}px`;
              this.visualizer!.style.left = `${rect.left + window.scrollX}px`;
            }),
          )
          .subscribe();

        document.body.appendChild(this.visualizer);
        break;
      default:
        throw new TraceyError(
          TraceyErrorCode.INVALID_CONFIGURATION,
          `Visualizer position ${this.visualizerPosition} is not supported.`,
        );
    }
  }
}
