import { EventType } from "./event-type";

export interface SerializedEvent<T> {
  type: EventType;
  ts: DOMHighResTimeStamp;
  data: T;
}
