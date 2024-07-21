import { TraceyOptions } from "../config/tracey-options";
import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface ResizeEventData {
  breakpoint: string;
}

export class ResizeEvent extends TraceyEvent<ResizeEventData> {
  constructor(private readonly breakpoint: string) {
    super(EventType.RESIZE);
  }

  toSerializable(): SerializedEvent<ResizeEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        breakpoint: this.breakpoint,
      },
    };
  }
}
