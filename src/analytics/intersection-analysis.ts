import { filter, Observable, tap } from "rxjs";
import { SharedOptions } from "../config/shared-options";
import { IntersectionEvent } from "../events/intersection-event";
import { Tracey } from "../tracey";
import { KeyValuePair } from "../util/key-value-pair";
import { Logger } from "../util/logger";
import { TimeSpan } from "../util/time-span";
import { ElementStatsVisualizer } from "../visualization/element-stats-visualizer";
import { Analysis, AnalysisResult } from "./analysis";

export interface IntersectionAnalysisResult extends AnalysisResult {
  enterCount: number;
  exitCount: number;
  visibleTimes: TimeSpan[];
  totalVisibleTime: number;
}

export class IntersectionAnalysis extends Analysis<IntersectionAnalysisResult> {
  private isVisible = false;
  private enterCount = 0;
  private exitCount = 0;
  private visibleTimes: TimeSpan[] = [];

  private readonly logger = new Logger(this.options, "IntersectionAnalysis");
  private readonly element: HTMLElement;

  constructor(
    tracey: Tracey,
    readonly selector: string,
    options?: SharedOptions,
  ) {
    super(tracey, options);
    this.element = document.querySelector(selector) as HTMLElement;

    if (!this.element) {
      throw new Error(`Element with selector "${selector}" not found.`);
    }
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
    ElementStatsVisualizer.define();

    const visualizer = document.createElement("element-stats-visualizer");
    this.element.appendChild(visualizer);

    return visualizer as ElementStatsVisualizer;
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
