import { filter, fromEvent, map, Observable } from "rxjs";
import { ClickEvent } from "../events/click-event";
import { EventProducer } from "./event-producer";

export class ClickEventProducer extends EventProducer<ClickEvent> {
  isEnabled(): boolean {
    return !this.options?.producers?.click?.disabled;
  }

  produce(): Observable<ClickEvent> {
    return fromEvent(document, "click").pipe(
      filter(() => this.isEnabled()),
      filter((e) => e instanceof MouseEvent),
      map((e) => new ClickEvent(e)),
    );
  }
}
