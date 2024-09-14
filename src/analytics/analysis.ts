import {
  iif,
  interval,
  merge,
  Observable,
  of,
  shareReplay,
  Subscription,
  tap,
} from "rxjs";
import { AnalysisOptions } from "../config/analysis-options";
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

      this.visualizerStack!.addVisualizer(this.visualizer);

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
}
