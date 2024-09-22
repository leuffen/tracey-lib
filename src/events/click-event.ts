import { getTraceyName } from "../util/attributes";
import { getHierarchySelector } from "../util/dom";
import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface ClickEventData {
  x: number;
  y: number;
  target?: {
    selector: string;
    dataTraceyName: string | null;
  };
}

export class ClickEvent extends TraceyEvent<ClickEventData> {
  readonly x: number;
  readonly y: number;
  readonly target: EventTarget | null;

  constructor(mouseEvent: MouseEvent) {
    super(EventType.CLICK);

    this.x = mouseEvent.pageX;
    this.y = mouseEvent.pageY;
    this.target = mouseEvent.target;
  }

  toSerializable(): SerializedEvent<ClickEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        x: this.x,
        y: this.y,
        target:
          this.target instanceof HTMLElement
            ? {
                selector: getHierarchySelector(this.target),
                dataTraceyName: getTraceyName(this.target),
              }
            : undefined,
      },
    };
  }
}
