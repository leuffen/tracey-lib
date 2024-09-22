import { filter, fromEvent, interval, map, tap } from "rxjs";
import { defaultDataTransferInterval } from "../config/defaults";
import { TraceyOptions } from "../config/tracey-options";
import { TraceyEvent } from "../events/tracey-event";
import { UnloadEvent } from "../events/unload-event";
import { Tracey } from "../tracey";

export class DataTransferService {
  private lastSentEventIndex = 0;

  constructor(
    private readonly tracey: Tracey,
    private readonly options: TraceyOptions,
  ) {}

  init() {
    if (!this.options.dataTransfer) {
      return;
    }

    fromEvent(window, "beforeunload")
      .pipe(
        map(() => [...this.getNextEventsForDataTransfer(), new UnloadEvent()]),
        tap((events) => this.sendEvents(events)),
      )
      .subscribe();

    interval(
      this.options?.dataTransfer?.interval ?? defaultDataTransferInterval,
    )
      .pipe(
        filter(() => document.visibilityState === "visible"),
        map(() => this.getNextEventsForDataTransfer()),
        filter((events) => events.length > 0),
        tap((events) => this.sendEvents(events)),
      )
      .subscribe();
  }

  private getNextEventsForDataTransfer() {
    const events = this.tracey.events.slice(this.lastSentEventIndex);
    this.lastSentEventIndex += events.length;

    return events;
  }

  private sendEvents(events: TraceyEvent<unknown>[]) {
    navigator.sendBeacon(
      this.options.dataTransfer!.endpoint,
      JSON.stringify(events.map((e) => e.toSerializable())),
    );
  }
}
