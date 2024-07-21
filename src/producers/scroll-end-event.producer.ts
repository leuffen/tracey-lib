import { filter, fromEvent, map, Observable } from "rxjs";
import { ScrollEndEvent } from "../events/scroll-end-event";
import { EventProducer } from "./event-producer";

export class ScrollEndEventProducer extends EventProducer<ScrollEndEvent> {
  isEnabled(): boolean {
    return !this.options?.producers?.scroll?.disabled;
  }

  produce(): Observable<ScrollEndEvent> {
    return fromEvent(window, "scrollend").pipe(
      filter(() => this.isEnabled()),
      map(() => new ScrollEndEvent()),
    );
  }
}
