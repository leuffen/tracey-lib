import {
  debounceTime,
  filter,
  fromEvent,
  map,
  Observable,
  throttleTime,
} from "rxjs";
import { ClickEvent } from "../events/click-event";
import { ScrollEvent } from "../events/scroll-event";
import { EventProducer } from "./event-producer";

export class ScrollEventProducer extends EventProducer<ScrollEvent> {
  produce(): Observable<ScrollEvent> {
    return fromEvent(window, "scroll").pipe(
      throttleTime(this.options?.producers?.scroll?.throttleTime ?? 500),
      map(() => new ScrollEvent()),
    );
  }
}
