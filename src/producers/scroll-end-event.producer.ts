import { fromEvent, map, Observable } from "rxjs";
import { ScrollEndEvent } from "../events/scroll-end-event";
import { EventProducer } from "./event-producer";

export class ScrollEndEventProducer extends EventProducer<ScrollEndEvent> {
  produce(): Observable<ScrollEndEvent> {
    return fromEvent(window, "scrollend").pipe(map(() => new ScrollEndEvent()));
  }
}
