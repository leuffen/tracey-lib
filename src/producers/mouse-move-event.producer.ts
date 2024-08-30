import { filter, fromEvent, map, Observable, throttleTime } from "rxjs";
import { defaultThrottleTime } from "../config/defaults";
import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { MouseMoveEvent } from "../events/mouse-move-event";
import { Logger } from "../util/logger";
import { EventProducer } from "./event-producer";

export class MouseMoveEventProducer extends EventProducer<MouseMoveEvent> {
  constructor(logger: Logger, options: TraceyOptions & SharedOptions) {
    super(logger, options);
  }

  isEnabled(): boolean {
    return !this.options?.producers?.mouse?.disabled;
  }

  produce(): Observable<MouseMoveEvent> {
    return fromEvent<MouseEvent>(window, "mousemove").pipe(
      filter(() => this.isEnabled()),
      throttleTime(
        this.options?.producers?.mouse?.throttleTime ?? defaultThrottleTime,
      ),
      map((e) => new MouseMoveEvent(e.pageX, e.pageY)),
    );
  }
}
