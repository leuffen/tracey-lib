import { filter, Observable, tap } from "rxjs";
import { VisualizerPosition } from "../config/analysis-options";
import { SharedOptions } from "../config/shared-options";
import { ClickEvent } from "../events/click-event";
import { Tracey } from "../tracey";
import { getTraceyName, TraceyAttributeNames } from "../util/attributes";
import { getHierarchySelector } from "../util/dom";
import { KeyValuePair } from "../util/key-value-pair";
import { Analysis, AnalysisResult } from "./analysis";

export interface ClickAnalysisResult extends AnalysisResult {
  clickCount: number;
}

export class ClickAnalysis extends Analysis<ClickAnalysisResult> {
  private clickCount = 0;
  private targetHits = new Map<Element, number>();

  constructor(tracey: Tracey, options?: SharedOptions) {
    super("ClickAnalysis", [VisualizerPosition.Global], tracey, options);
  }

  protected override observe(
    eventStream$: Observable<unknown>,
  ): Observable<unknown> {
    return eventStream$?.pipe(
      filter((e) => e instanceof ClickEvent),
      tap((e) => {
        this.clickCount++;

        const target = (e as ClickEvent).target;
        if (target instanceof Element) {
          this.targetHits.set(target, (this.targetHits.get(target) || 0) + 1);
        }
      }),
    );
  }

  protected override getResult(): ClickAnalysisResult {
    return {
      ...this.getBaseResult(),
      clickCount: this.clickCount,
    };
  }

  protected override getVisualizerData(): KeyValuePair[] {
    const pairs = [{ key: "Click Count", value: this.clickCount }];

    for (const [target, hitCount] of this.targetHits.entries()) {
      let key = getHierarchySelector(target);
      if (target.hasAttribute(TraceyAttributeNames.DATA_TRACEY_NAME)) {
        key += ` (${getTraceyName(target)})`;
      }
      pairs.push({ key, value: hitCount });
    }

    return pairs;
  }
}
