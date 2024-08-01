import { interval, merge, Observable, Subscription, tap } from "rxjs";
import { AnalysisOptions } from "../config/analysis-options";
import { defaultVisualizerInterval } from "../config/defaults";
import { SharedOptions } from "../config/shared-options";
import { TraceyEvent } from "../events/tracey-event";
import { Tracey } from "../tracey";
import { KeyValuePair } from "../util/key-value-pair";
import { ElementStatsVisualizer } from "../visualization/element-stats-visualizer";

export interface AnalysisResult {
  timing: {
    start: DOMHighResTimeStamp;
    end: DOMHighResTimeStamp;
  };
}

export abstract class Analysis<R extends AnalysisResult> {
  private visualizer?: ElementStatsVisualizer;
  private visualizerSubscription?: Subscription;

  protected subscription?: Subscription;
  protected startTime?: DOMHighResTimeStamp;
  protected endTime?: DOMHighResTimeStamp;

  protected abstract setupVisualizer(): ElementStatsVisualizer;
  protected abstract getVisualizerData(): KeyValuePair[];

  protected abstract getResult(): R;
  protected abstract observe(
    eventStream$: Observable<TraceyEvent<unknown>>,
  ): Observable<unknown>;

  protected constructor(
    protected readonly tracey: Tracey,
    protected readonly options?: SharedOptions & AnalysisOptions,
  ) {}

  protected getBaseResult(): AnalysisResult {
    return {
      timing: {
        start: this.startTime!,
        end: this.endTime!,
      },
    };
  }

  start(): void {
    if (!this.tracey.eventStream$) {
      throw new Error(
        "Event stream not initialized. Tracey instance has not been started yet.",
      );
    }

    const stream$ = this.observe(this.tracey.eventStream$);

    if (this.shouldVisualize) {
      this.visualizer = this.setupVisualizer();
      this.visualizerSubscription = merge(
        stream$,
        interval(this.visualizerInterval),
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
    this.subscription = this.observe(this.tracey.eventStream$).subscribe();
  }

  stop(): R {
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
}
