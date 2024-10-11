import { IntersectionAnalysis } from "../analytics/intersection-analysis";
import { EventType } from "../events/event-type";
import { IntersectionEventData } from "../events/intersection-event";
import {
  AnySerializedEvent,
  SerializedEvent,
} from "../events/serialized-event";
import { UnloadEventData } from "../events/unload-event";

export function visualizeEvents(events: AnySerializedEvent[]): void {
  const intersectionEvents = events.filter(
    (e) =>
      e.type === EventType.INTERSECTION &&
      !!(e.data as IntersectionEventData).target?.dataTraceyName,
  ) as SerializedEvent<IntersectionEventData>[];

  const intersectionsByElement: {
    [name: string]: SerializedEvent<IntersectionEventData | UnloadEventData>[];
  } = Object.groupBy(intersectionEvents, (e) => e.data.target?.dataTraceyName);
  const unloadEvent = events.find(
    (e) => e.type === EventType.UNLOAD,
  ) as SerializedEvent<UnloadEventData>;
  for (const name in intersectionsByElement) {
    intersectionsByElement[name].push(unloadEvent);
    const result = IntersectionAnalysis.fromEvents(
      intersectionsByElement[name],
    );

    const el = document.querySelector(`[data-tracey-name="${name}"]`);
    if (el instanceof HTMLElement) {
      IntersectionAnalysis.createStaticVisualizer(el, result);
    }
  }
}
