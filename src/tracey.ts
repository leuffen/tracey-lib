import { tap } from "rxjs";
import { ClickEventProducer } from "./producers/click-event.producer";
import { TraceyEvent } from "./events/tracey-event";

export class Tracey {
  readonly timeOrigin = performance.timeOrigin;
  readonly events: TraceyEvent<unknown>[] = [];

  init(): void {
    console.log(`Tracey initialized.`);
    console.log(`--> timeOrigin: ${this.timeOrigin}`);
  }

  constructor(options?: { debug?: boolean }) {
    const clickListener = new ClickEventProducer(options);
    clickListener
      .produce()
      .pipe(tap((e) => this.events.push(e)))
      .subscribe();
  }

  dump(): void {
    console.log(this.events.map((e) => e.toSerializable()));
  }
}
