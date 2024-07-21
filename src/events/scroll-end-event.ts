import { TraceyOptions } from "../config/tracey-options";
import { EventType } from "./event-type";
import { ScrollEvent } from "./scroll-event";
import { SerializedEvent } from "./serialized-event";
import { TraceyEvent } from "./tracey-event";

export class ScrollEndEvent extends ScrollEvent {
  constructor() {
    super(window.scrollX, window.scrollY, EventType.SCROLL_END);
  }
}
