import { filter, fromEvent, map, Observable } from "rxjs";
import { VisibilityStateEvent } from "../events/visibility-state-event";
import { EventProducer } from "./event-producer";

export class VisibilityStateEventProducer extends EventProducer<VisibilityStateEvent> {
  isEnabled(): boolean {
    return !this.options?.producers?.visibilityState?.disabled;
  }
  produce(): Observable<VisibilityStateEvent> {
    return fromEvent(document, "visibilitychange").pipe(
      filter(() => this.isEnabled()),
      map(() => new VisibilityStateEvent()),
    );
  }
}
