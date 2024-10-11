export enum TraceyAttributeNames {
  DATA_LABEL = "data-label",
  DATA_TRACEY_NAME = "data-tracey-name",
  DATA_TRACEY_ID = "data-tracey-id",
  DATA_TRACEY_HOST_ID = "data-tracey-host-id",
}

export function getTraceyName(element: Element): string | null {
  return element.getAttribute(TraceyAttributeNames.DATA_TRACEY_NAME);
}
