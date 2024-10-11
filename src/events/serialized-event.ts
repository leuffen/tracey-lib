import { ClickEventData } from "./click-event";
import { EventType } from "./event-type";
import { InitEventData } from "./init-event";
import { IntersectionEventData } from "./intersection-event";
import { MouseMoveEventData } from "./mouse-move-event";
import { ResizeEventData } from "./resize-event";
import { ScrollEventData } from "./scroll-event";
import { UnloadEventData } from "./unload-event";
import { VisibilityStateEventData } from "./visibility-state-event";

export interface SerializedEvent<T> {
  type: EventType;
  ts: DOMHighResTimeStamp;
  data: T;
}

export type AnySerializedEvent =
  | SerializedEvent<InitEventData>
  | SerializedEvent<UnloadEventData>
  | SerializedEvent<ClickEventData>
  | SerializedEvent<MouseMoveEventData>
  | SerializedEvent<ScrollEventData>
  | SerializedEvent<IntersectionEventData>
  | SerializedEvent<ResizeEventData>
  | SerializedEvent<VisibilityStateEventData>;
