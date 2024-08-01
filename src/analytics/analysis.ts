import { Observable, Subscription } from "rxjs";
import { SharedOptions } from "../config/shared-options";
import { TraceyEvent } from "../events/tracey-event";
import { Tracey } from "../tracey";

export interface AnalysisResult {
  timing: {
    start: DOMHighResTimeStamp;
    end: DOMHighResTimeStamp;
  };
}

export abstract class Analysis<R extends AnalysisResult> {
  protected subscription?: Subscription;
  protected startTime?: DOMHighResTimeStamp;
  protected endTime?: DOMHighResTimeStamp;

  protected abstract getResult(): R;
  protected abstract observe(
    eventStream$: Observable<TraceyEvent<unknown>>,
  ): Observable<unknown>;

  protected constructor(
    protected readonly tracey: Tracey,
    protected readonly options?: SharedOptions,
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

    this.startTime = performance.now();
    this.subscription = this.observe(this.tracey.eventStream$).subscribe();
  }

  stop(): R {
    this.endTime = performance.now();
    this.subscription?.unsubscribe();
    return this.getResult();
  }
}
