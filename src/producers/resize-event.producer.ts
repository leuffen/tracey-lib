import { distinctUntilChanged, filter, fromEvent, map, Observable } from "rxjs";
import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { ClickEvent } from "../events/click-event";
import { ResizeEvent, ResizeEventData } from "../events/resize-event";
import { BreakpointDeterminer } from "../util/breakpoints";
import { Logger } from "../util/logger";
import { EventProducer } from "./event-producer";

export class ResizeEventProducer extends EventProducer<ResizeEvent> {
  constructor(
    private readonly breakpointDeterminer: BreakpointDeterminer,
    logger: Logger,
    options: TraceyOptions & SharedOptions,
  ) {
    super(logger, options);
  }

  produce(): Observable<ResizeEvent> {
    return fromEvent(window, "resize").pipe(
      map(() => ({
        h: this.breakpointDeterminer.getHorizontalBreakpoint(),
        v: this.breakpointDeterminer.getVerticalBreakpoint(),
      })),
      distinctUntilChanged(
        (prev, curr) => prev.h === curr.h && prev.v === curr.v,
      ),
      map(({ h, v }) => new ResizeEvent(h, v)),
    );
  }
}
