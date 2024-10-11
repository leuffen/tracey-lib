export interface TimeSpan {
  start: DOMHighResTimeStamp;
  end?: DOMHighResTimeStamp;
  duration?: number;
}

export function getDuration(spans: TimeSpan[]): number {
  return spans.reduce(
    (acc, cur) => acc + (cur.duration ?? performance.now() - cur.start),
    0,
  );
}
