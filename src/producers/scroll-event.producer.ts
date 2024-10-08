import { filter, fromEvent, map, Observable, throttleTime } from "rxjs";
import { defaultThrottleTime } from "../config/defaults";
import { ScrollEvent } from "../events/scroll-event";
import { EventProducer } from "./event-producer";

export class ScrollEventProducer extends EventProducer<ScrollEvent> {
  isEnabled(): boolean {
    return !this.options?.producers?.scroll?.disabled;
  }
  produce(): Observable<ScrollEvent> {
    return fromEvent(window, "scroll").pipe(
      filter(() => this.isEnabled()),
      throttleTime(
        this.options?.producers?.scroll?.throttleTime ?? defaultThrottleTime,
      ),
      map(() => new ScrollEvent()),
    );
  }
}
