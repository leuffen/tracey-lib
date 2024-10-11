import { filter, fromEvent, interval, map, tap } from "rxjs";
import {
  defaultDataTransferEventCount,
  defaultDataTransferInterval,
} from "../config/defaults";
import { SharedOptions } from "../config/shared-options";
import { TraceyOptions } from "../config/tracey-options";
import { TraceyEvent } from "../events/tracey-event";
import { UnloadEvent } from "../events/unload-event";
import { Tracey } from "../tracey";
import { Modes } from "../util/modes";
import { DataTransferQueryParams } from "./query-params";

export class DataTransferService {
  private lastSentEventIndex = 0;

  constructor(
    private readonly tracey: Tracey,
    private readonly options: TraceyOptions & SharedOptions,
  ) {
    if (this.options?.dataTransfer?.minEventCount) {
      if (
        !Number.isInteger(this.options.dataTransfer.minEventCount) ||
        this.options.dataTransfer.minEventCount < 0
      ) {
        throw new Error(
          "dataTransfer.minEventCount must be a positive integer",
        );
      }
    }
  }

  init() {
    if (!this.options.dataTransfer || this.tracey.mode !== Modes.CAPTURE) {
      return;
    }

    fromEvent(window, "beforeunload")
      .pipe(
        map(() => [
          ...this.getNextEventsForDataTransfer(true),
          new UnloadEvent(),
        ]),
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

  private get minEventsCount(): number {
    return (
      this.options?.dataTransfer?.minEventCount ?? defaultDataTransferEventCount
    );
  }

  private getNextEventsForDataTransfer(force = false) {
    const events = this.tracey.events.slice(this.lastSentEventIndex);
    if (!force && events.length < this.minEventsCount) {
      return [];
    }

    this.lastSentEventIndex += events.length;

    return events;
  }

  private sendEvents(events: TraceyEvent<unknown>[]) {
    const url = new URL(this.options.dataTransfer!.endpoint);

    if (this.tracey.visitId) {
      url.searchParams.set(
        DataTransferQueryParams.VISIT_ID,
        this.tracey.visitId,
      );
    }

    if (this.options?.debug) {
      url.searchParams.set(DataTransferQueryParams.PUBLIC, "true");
    }

    navigator.sendBeacon(
      url,
      JSON.stringify(events.map((e) => e.toSerializable())),
    );
  }
}
