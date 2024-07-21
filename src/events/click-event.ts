import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface ClickEventData {
  x_rel: number;
  y_rel: number;
}

export class ClickEvent extends TraceyEvent<ClickEventData> {
  readonly x_rel: number;
  readonly y_rel: number;

  constructor(mouseEvent: MouseEvent) {
    super(EventType.CLICK);

    const documentRect = document.documentElement.getBoundingClientRect();
    this.x_rel = mouseEvent.pageX / documentRect.width;
    this.y_rel = mouseEvent.pageY / documentRect.height;
  }

  toSerializable(): SerializedEvent<ClickEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        x_rel: this.x_rel,
        y_rel: this.y_rel,
      },
    };
  }
}
