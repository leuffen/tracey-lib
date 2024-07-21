import {
  debounceTime,
  filter,
  fromEvent,
  map,
  Observable,
  throttleTime,
} from "rxjs";
import { ClickEvent } from "../events/click-event";
import { ScrollEndEvent } from "../events/scroll-end-event";
import { ScrollEvent } from "../events/scroll-event";
import { EventProducer } from "./event-producer";

export class ScrollEndEventProducer extends EventProducer<ScrollEndEvent> {
  produce(): Observable<ScrollEndEvent> {
    return fromEvent(window, "scrollend").pipe(map(() => new ScrollEndEvent()));
  }
}
