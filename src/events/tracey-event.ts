import { EventType } from "./event-type";
import { SerializedEvent } from "./serialized-event";

export abstract class TraceyEvent<T> {
  readonly timestamp = performance.now();

  protected constructor(readonly type: EventType) {}

  abstract toSerializable(): SerializedEvent<T>;

  toJSON(): string {
    return JSON.stringify(this.toSerializable());
  }
}
