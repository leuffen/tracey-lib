import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface InitEventData {
  options?: SharedOptions & TraceyOptions;
  timing: {
    origin: DOMHighResTimeStamp;
    ctor: DOMHighResTimeStamp;
    init: DOMHighResTimeStamp;
  };
}

export class InitEvent extends TraceyEvent<InitEventData> {
  constructor(readonly data: InitEventData) {
    super(EventType.INIT);
  }

  toSerializable(): SerializedEvent<InitEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: this.data,
    };
  }
}
