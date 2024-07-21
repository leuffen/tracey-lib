import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export interface IntersectionEventData {
  selector: string;
  intersectionRatio: number;
  isVisible: boolean;
  dataTraceyName?: string;
}

export class IntersectionEvent extends TraceyEvent<IntersectionEventData> {
  constructor(
    readonly selector: string,
    readonly intersectionRatio: number,
    readonly isVisible: boolean,
    readonly dataTraceyName?: string,
  ) {
    super(EventType.INTERSECTION);
  }

  toSerializable(): SerializedEvent<IntersectionEventData> {
    return {
      type: this.type,
      ts: this.timestamp,
      data: {
        selector: this.selector,
        intersectionRatio: this.intersectionRatio,
        isVisible: this.isVisible,
        dataTraceyName: this.dataTraceyName,
      },
    };
  }
}
