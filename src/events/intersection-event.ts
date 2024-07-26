import { getHierarchySelector } from "../util/dom";
import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface IntersectionEventData {
  selector: string;
  intersectionRatio: number;
  isVisible: boolean;
  target?: {
    selector: string;
    dataTraceyName: string | null;
  };
}

export class IntersectionEvent extends TraceyEvent<IntersectionEventData> {
  constructor(
    readonly selector: string,
    readonly intersectionRatio: number,
    readonly isVisible: boolean,
    readonly target: Element | null,
  ) {
    super(EventType.INTERSECTION);
  }

  toSerializable(): SerializedEvent<IntersectionEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        selector: this.selector,
        intersectionRatio: this.intersectionRatio,
        isVisible: this.isVisible,
        target:
          this.target instanceof HTMLElement
            ? {
                selector: getHierarchySelector(this.target),
                dataTraceyName: this.target.getAttribute("data-tracey-name"),
              }
            : undefined,
      },
    };
  }
}
