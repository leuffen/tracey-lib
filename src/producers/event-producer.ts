import { Observable, tap } from "rxjs";

export abstract class EventProducer<T> {
  abstract produce(): Observable<T>;

  constructor(options?: { debug?: boolean }) {
    if (options?.debug) {
      console.log(`EventProducer ${this.name} initialized.`);

      this.produce()
        .pipe(tap((e) => console.log(this.name, e)))
        .subscribe();
    }
  }

  private get name(): string {
    return this.constructor.name;
  }
}
