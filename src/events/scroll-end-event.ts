import { EventType } from "./event-type";
import { ScrollEvent } from "./scroll-event";

export class ScrollEndEvent extends ScrollEvent {
  constructor() {
    super(window.scrollX, window.scrollY, EventType.SCROLL_END);
  }
}
