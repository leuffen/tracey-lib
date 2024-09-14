import { filter, Observable, tap } from "rxjs";
import { SharedOptions } from "../config/shared-options";
import { IntersectionEvent } from "../events/intersection-event";
import { Tracey } from "../tracey";
import { TraceyAttributeNames } from "../util/attributes";
import { KeyValuePair } from "../util/key-value-pair";
import { TimeSpan } from "../util/time-span";
import { ElementStatsVisualizer } from "../visualization/element-stats-visualizer";
import { Analysis, AnalysisResult } from "./analysis";

export interface IntersectionAnalysisResult extends AnalysisResult {
  enterCount: number;
  exitCount: number;
  visibleTimes: TimeSpan[];
  totalVisibleTime: number;
}

const InternalConstructorCall = Symbol.for("internalConstructorCall");

export class IntersectionAnalysis extends Analysis<IntersectionAnalysisResult> {
  private isVisible = false;
  private enterCount = 0;
  private exitCount = 0;
  private visibleTimes: TimeSpan[] = [];

  static create(
    selector: string,
    tracey: Tracey,
    options?: SharedOptions,
  ): IntersectionAnalysis[] {
    const elements = document.querySelectorAll(selector);

    if (!elements.length) {
      throw new Error(`No elements found with selector "${selector}".`);
    }

    return Array.from(elements).map(
      (element) =>
        new IntersectionAnalysis(
          element,
          tracey,
          options,
          // @ts-expect-error
          InternalConstructorCall,
        ),
    );
  }

  constructor(
    private readonly element: Element,
    tracey: Tracey,
    options?: SharedOptions,
  ) {
    if (arguments[3] !== InternalConstructorCall) {
      throw new Error(
        "Use the static create() method to create instances of IntersectionAnalysis.",
      );
    }

    super("IntersectionAnalysis", tracey, options);
  }

  protected override observe(
    eventStream$: Observable<unknown>,
  ): Observable<unknown> {
    return eventStream$?.pipe(
      filter((e) => e instanceof IntersectionEvent),
      filter((e) => e.target === this.element),
      tap((e) => {
        if (!this.isVisible && e.isVisible) {
          this.isVisible = true;
          this.enterCount++;
          this.logger.debug(`Element entered for the ${this.enterCount}. time`);

          this.visibleTimes.push({
            start: e.timestamp,
          });
        } else if (this.isVisible && !e.isVisible) {
          this.isVisible = false;
          this.exitCount++;
          this.logger.debug(`Element exited for the ${this.exitCount}. time`);

          const currentVisibleTime =
            this.visibleTimes[this.visibleTimes.length - 1];
          if (currentVisibleTime) {
            currentVisibleTime.end = e.timestamp;
            currentVisibleTime.duration =
              currentVisibleTime.end - currentVisibleTime.start;
            this.logger.debug("Ended visibility time span", currentVisibleTime);
          } else {
            this.logger.debug(
              "No current visible time span found, although the element changed from visible to invisible.",
            );
          }
        }
      }),
    );
  }

  protected override getResult(): IntersectionAnalysisResult {
    return {
      ...this.getBaseResult(),
      enterCount: this.enterCount,
      exitCount: this.exitCount,
      visibleTimes: this.visibleTimes,
      totalVisibleTime: this.totalVisibleTime,
    };
  }

  private get totalVisibleTime(): number {
    return this.visibleTimes.reduce(
      (acc, cur) => acc + (cur.duration ?? performance.now() - cur.start),
      0,
    );
  }

  protected override setupVisualizer(): ElementStatsVisualizer {
    const visualizer = super.setupVisualizer();
    const randomId = Math.random().toString(36).substring(2, 15);

    this.element.setAttribute(TraceyAttributeNames.DATA_TRACEY_ID, randomId);
    visualizer.setAttribute(TraceyAttributeNames.DATA_TRACEY_HOST_ID, randomId);

    return visualizer;
  }

  protected override getVisualizerData(): KeyValuePair[] {
    return [
      { key: "Enter count", value: this.enterCount },
      { key: "Exit count", value: this.exitCount },
      { key: "Visible times", value: this.visibleTimes.length },
      { key: "Total visible time", value: this.totalVisibleTime + "ms" },
    ];
  }
}
