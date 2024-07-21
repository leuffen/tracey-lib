import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface VisibilityStateEventData {
  state: DocumentVisibilityState;
}

export class VisibilityStateEvent extends TraceyEvent<VisibilityStateEventData> {
  constructor(readonly state = document.visibilityState) {
    super(EventType.VISIBILITY_STATE);
  }

  toSerializable(): SerializedEvent<VisibilityStateEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        state: this.state,
      },
    };
  }
}
