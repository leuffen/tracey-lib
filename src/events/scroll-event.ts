import { TraceyOptions } from "../config/tracey-options";
import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface ScrollEventData {
  x: number;
  y: number;
}

export class ScrollEvent extends TraceyEvent<ScrollEventData> {
  constructor(
    readonly x = window.scrollX,
    readonly y = window.scrollY,
    type = EventType.SCROLL,
  ) {
    super(type);
  }

  toSerializable(): SerializedEvent<ScrollEventData> {
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
