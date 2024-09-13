export enum TraceyAttributeNames {
  DATA_TRACEY_NAME = "data-tracey-name",
}

export function getTraceyName(element: Element): string | null {
  return element.getAttribute(TraceyAttributeNames.DATA_TRACEY_NAME);
}
