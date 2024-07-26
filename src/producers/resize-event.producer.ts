import { distinctUntilChanged, filter, fromEvent, map, Observable } from "rxjs";
import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { ResizeEvent } from "../events/resize-event";
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

  isEnabled(): boolean {
    return !this.options?.producers?.resize?.disabled;
  }

  produce(): Observable<ResizeEvent> {
    return fromEvent(window, "resize").pipe(
      filter(() => this.isEnabled()),
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
