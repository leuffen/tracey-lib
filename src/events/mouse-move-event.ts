import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface MouseMoveEventData {
  x: number;
  y: number;
}

export class MouseMoveEvent extends TraceyEvent<MouseMoveEventData> {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {
    super(EventType.MOUSE);
  }

  toSerializable(): SerializedEvent<MouseMoveEventData> {
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
