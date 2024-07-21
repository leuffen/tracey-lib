import { filter, Observable, Subscriber } from "rxjs";
import { IntersectionEvent } from "../events/intersection-event";
import { EventProducer } from "./event-producer";

export class IntersectionEventProducer extends EventProducer<IntersectionEvent> {
  isEnabled(): boolean {
    return !this.options?.producers?.intersection?.disabled;
  }

  produce(): Observable<IntersectionEvent> {
    return new Observable<IntersectionEvent>((subscriber) => {
      const observers: IntersectionObserver[] = [];
      for (const selector of this.options.producers?.intersection?.selectors ??
        []) {
        const elements = document.querySelectorAll(selector);
        const observer = this.makeIntersectionObserver(selector, subscriber);
        for (const element of elements) {
          observer.observe(element);
        }
        observers.push(observer);
      }

      return () => observers.forEach((observer) => observer.disconnect());
    }).pipe(filter(() => this.isEnabled()));
  }

  private makeIntersectionObserver(
    selector: string,
    subscriber: Subscriber<IntersectionEvent>,
  ): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const dataTraceyName =
            entry.target.getAttribute("data-tracey-name") ?? undefined;
          subscriber.next(
            new IntersectionEvent(
              selector,
              entry.intersectionRatio,
              entry.isIntersecting,
              dataTraceyName,
            ),
          );
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
  }
}
