import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export class UnloadEvent extends TraceyEvent<{}> {
  constructor() {
    super(EventType.UNLOAD);
  }

  toSerializable(): SerializedEvent<{}> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {},
    };
  }
}
