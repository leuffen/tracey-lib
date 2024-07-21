import { fromEvent, map, Observable } from "rxjs";
import { VisibilityStateEvent } from "../events/visibility-state-event";
import { EventProducer } from "./event-producer";

export class VisibilityStateEventProducer extends EventProducer<VisibilityStateEvent> {
  produce(): Observable<VisibilityStateEvent> {
    return fromEvent(document, "visibilitychange").pipe(
      map(() => new VisibilityStateEvent()),
    );
  }
}
