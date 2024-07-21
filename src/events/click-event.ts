import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface ClickEventData {
  x: number;
  y: number;
}

export class ClickEvent extends TraceyEvent<ClickEventData> {
  readonly x: number;
  readonly y: number;

  constructor(mouseEvent: MouseEvent) {
    super(EventType.CLICK);

    this.x = mouseEvent.pageX;
    this.y = mouseEvent.pageY;
  }

  toSerializable(): SerializedEvent<ClickEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        x: this.x,
        y: this.y,
      },
    };
  }
}
