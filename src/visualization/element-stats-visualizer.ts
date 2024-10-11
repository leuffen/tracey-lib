import { fromEvent, merge, Subscription, tap } from "rxjs";
import { getTraceyName, TraceyAttributeNames } from "../util/attributes";
import { getHierarchySelector } from "../util/dom";
import { KeyValuePair } from "../util/key-value-pair";

export class ElementStatsVisualizer extends HTMLElement {
  static define(
    tag = "element-stats-visualizer",
    registry = customElements,
  ): string {
    if (!registry.get(tag)) {
      registry.define(tag, this);
    }

    return tag;
  }

  static defineAndCreate(): ElementStatsVisualizer {
    const tag = ElementStatsVisualizer.define();
    return document.createElement(tag) as ElementStatsVisualizer;
  }

  private observedElement?: Element;
  private observedElementIsVisible = false;
  private observedElementObserver?: IntersectionObserver;

  private forceExpanded = false;
  private isExpanded = true;

  private readonly shadow: ShadowRoot;
  #data: KeyValuePair[] = [];

  set data(value: KeyValuePair[]) {
    this.#data = value;
    this.render();
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.setupObservedElement();
    this.render();
  }

  disconnectedCallback(): void {
    if (this.observedElementObserver) {
      this.observedElementObserver.disconnect();
    }
  }

  attachToElement(element: Element): Subscription {
    this.style.position = "absolute";
    document.body.appendChild(this);

    return merge(fromEvent(window, "scroll"), fromEvent(window, "resize"))
      .pipe(
        tap(() => {
          const rect = element.getBoundingClientRect();
          this.style.top = `${rect.top + window.scrollY}px`;
          this.style.left = `${rect.left + window.scrollX}px`;
        }),
      )
      .subscribe();
  }

  private setupObservedElement(): void {
    const id = this.getAttribute(TraceyAttributeNames.DATA_TRACEY_HOST_ID);
    this.observedElement =
      document.querySelector(
        `[${TraceyAttributeNames.DATA_TRACEY_ID}="${id}"]`,
      ) ?? undefined;

    if (this.observedElement) {
      const observer = new IntersectionObserver((entries) => {
        this.observedElementIsVisible = entries.some(
          (entry) => entry.isIntersecting,
        );
        this.isExpanded = this.observedElementIsVisible || this.forceExpanded;

        this.render();
      });

      observer.observe(this.observedElement);
      this.observedElementObserver = observer;
    }
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          position: static;
          display: block;
          
          opacity: .2;
          background: white;
          line-height: 1;
          font-size: 1rem;
          
          transition: opacity .2s;
        }
        
        :host(:hover) {
          opacity: 1;
        }
        
        :host > div {
          border: 1px solid red;
          font-size: 12px;
          padding: 4px;
        }
        
        .heading {
          letter-spacing: 1px;
          text-decoration: underline;
          display: block;
          margin-bottom: 4px;
        }
        
        table {
          border-collapse: collapse;
        }
        
        table td:first-child {
          padding-right: 12px;
        }
      </style>
      <div>
        <span class="heading">${this.label}</span>
        ${this.getTableHtml()}
      </div>
    `;

    if (!this.isExpanded) {
      this.shadow.querySelector("[data-expand-btn]")?.addEventListener(
        "click",
        () => {
          this.forceExpanded = true;
          this.isExpanded = true;
          this.render();
        },
        { once: true },
      );
    }
    if (this.forceExpanded) {
      this.shadow.querySelector("[data-collapse-btn]")?.addEventListener(
        "click",
        () => {
          this.forceExpanded = false;
          this.isExpanded = false;
          this.render();
        },
        { once: true },
      );
    }
  }

  private get label(): string {
    return (
      this.getAttribute(TraceyAttributeNames.DATA_LABEL) ??
      "Element Information"
    );
  }

  private getTableHtml(): string {
    if (!this.isExpanded) {
      return `<span data-expand-btn>(expand)</span>`;
    }

    return `
      <table>
        <tbody>
          ${this.getHostSelectorTableRow()}
          ${this.getDataTraceyNameTableRow()}
          ${this.#data.map((entry) => this.getTableRowHtml(entry)).join("")}
        </tbody>
      </table>
      
      ${this.forceExpanded ? "<span data-collapse-btn>(collapse)</span>" : ""}
    `;
  }

  private getTableRowHtml(keyValuePair: KeyValuePair): string {
    return `
      <tr>
        <td><strong>${keyValuePair.key}</strong></td>
        <td><code>${keyValuePair.value}</code></td>
      </tr>
    `;
  }

  private getHostSelectorTableRow(): string {
    if (!this.observedElement) {
      return "";
    }

    return this.getTableRowHtml({
      key: "Host Selector",
      value: getHierarchySelector(this.observedElement),
    });
  }

  private getDataTraceyNameTableRow(): string {
    if (!this.observedElement) {
      return "";
    }

    return this.getTableRowHtml({
      key: TraceyAttributeNames.DATA_TRACEY_NAME,
      value: getTraceyName(this.observedElement) ?? "-",
    });
  }
}
