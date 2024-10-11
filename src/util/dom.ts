import { TraceyAttributeNames } from "./attributes";

export function getHierarchySelector(element: Element | null): string {
  const parts: string[] = [];

  while (element) {
    const part = element.id ? `#${element.id}` : element.nodeName.toLowerCase();
    parts.unshift(part);
    if (element === element.ownerDocument.documentElement) {
      break;
    }
    element = element.parentElement;
  }

  return parts.join(" > ");
}

export function getElementByTraceyName(name: string): Element | null {
  return document.querySelector(
    `[${TraceyAttributeNames.DATA_TRACEY_NAME}="${name}"]`,
  );
}
