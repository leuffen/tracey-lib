import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface ResizeEventData {
  breakpointHorizontal: string;
  breakpointVertical: string;
}

export class ResizeEvent extends TraceyEvent<ResizeEventData> {
  constructor(
    private readonly breakpointHorizontal: string,
    private readonly breakpointVertical: string,
  ) {
    super(EventType.RESIZE);
  }

  toSerializable(): SerializedEvent<ResizeEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        breakpointHorizontal: this.breakpointHorizontal,
        breakpointVertical: this.breakpointVertical,
      },
    };
  }
}
