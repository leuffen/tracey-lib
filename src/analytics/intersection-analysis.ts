import { filter, Observable, tap } from "rxjs";
import { VisualizerPosition } from "../config/analysis-options";
import { SharedOptions } from "../config/shared-options";
import { EventType } from "../events/event-type";
import {
  IntersectionEvent,
  IntersectionEventData,
} from "../events/intersection-event";
import { SerializedEvent } from "../events/serialized-event";
import { UnloadEventData } from "../events/unload-event";
import { Tracey } from "../tracey";
import { TraceyAttributeNames } from "../util/attributes";
import { KeyValuePair } from "../util/key-value-pair";
import { getDuration, TimeSpan } from "../util/time-span";
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

  private static resultToVisualizerData(
    result: IntersectionAnalysisResult,
  ): KeyValuePair[] {
    return [
      { key: "Enter count", value: result.enterCount },
      { key: "Exit count", value: result.exitCount },
      { key: "Visible times", value: result.visibleTimes.length },
      { key: "Total visible time", value: result.totalVisibleTime + "ms" },
    ];
  }

  static createStaticVisualizer(
    element: HTMLElement,
    result: IntersectionAnalysisResult,
  ) {
    const visualizer = ElementStatsVisualizer.defineAndCreate();
    visualizer.data = IntersectionAnalysis.resultToVisualizerData(result);
    visualizer.attachToElement(element);
  }

  static fromEvents(
    events: SerializedEvent<IntersectionEventData | UnloadEventData>[],
  ): IntersectionAnalysisResult {
    const first = events[0];
    const last = events[events.length - 1];

    if (last.type !== EventType.UNLOAD) {
      throw new Error(
        `The last event in the provided list must be an ${EventType.UNLOAD} event.`,
      );
    }

    let isVisible = false;
    let enterCount = 0;
    let exitCount = 0;
    const visibleTimes: TimeSpan[] = [];

    function visibilityStarted(e: SerializedEvent<any>): void {
      isVisible = true;
      enterCount++;

      visibleTimes.push({
        start: e.ts,
      });
    }

    function visibilityEnded(e: SerializedEvent<any>): void {
      isVisible = false;
      exitCount++;

      const currentVisibleTime = visibleTimes[visibleTimes.length - 1];
      if (currentVisibleTime) {
        currentVisibleTime.end = e.ts;
        currentVisibleTime.duration =
          currentVisibleTime.end - currentVisibleTime.start;
      }
    }

    for (const event of events) {
      if (event.type === EventType.UNLOAD) {
        // The unload event is treated as a last "not-visible-anymore" event.
        if (isVisible) {
          visibilityEnded(event);
        }
        continue;
      }

      if (!isVisible && (event.data as IntersectionEventData).isVisible) {
        visibilityStarted(event);
      } else if (
        isVisible &&
        !(event.data as IntersectionEventData).isVisible
      ) {
        visibilityEnded(event);
      }
    }

    return {
      timing: {
        start: first.ts,
        end: last.ts,
      },
      enterCount,
      exitCount,
      visibleTimes,
      totalVisibleTime: getDuration(visibleTimes),
    };
  }

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

    super(
      "IntersectionAnalysis",
      [VisualizerPosition.Global, VisualizerPosition.Element],
      tracey,
      options,
    );
  }

  protected override getObservedElement(): Element {
    return this.element;
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
    return getDuration(this.visibleTimes);
  }

  protected override setupVisualizer(): ElementStatsVisualizer {
    const visualizer = super.setupVisualizer();
    const randomId = Math.random().toString(36).substring(2, 15);

    this.element.setAttribute(TraceyAttributeNames.DATA_TRACEY_ID, randomId);
    visualizer.setAttribute(TraceyAttributeNames.DATA_TRACEY_HOST_ID, randomId);

    return visualizer;
  }

  protected override getVisualizerData(): KeyValuePair[] {
    return IntersectionAnalysis.resultToVisualizerData(this.getResult());
  }
}
