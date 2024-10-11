import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface UnloadEventData {}

export class UnloadEvent extends TraceyEvent<UnloadEventData> {
  constructor() {
    super(EventType.UNLOAD);
  }

  toSerializable(): SerializedEvent<UnloadEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {},
    };
  }
}
