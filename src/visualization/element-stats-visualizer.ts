import { getHierarchySelector } from "../util/dom";
import { KeyValuePair } from "../util/key-value-pair";

export class ElementStatsVisualizer extends HTMLElement {
  static define(
    tag = "element-stats-visualizer",
    registry = customElements,
  ): void {
    if (!registry.get(tag)) {
      registry.define(tag, this);
    }
  }

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
    this.render();
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          right: 0;
          
          opacity: .4;
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
          text-transform: uppercase;
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
        <span class="heading">Element Information</span>
        ${this.getTableHtml()}
      </div>
    `;
  }

  private getTableHtml(): string {
    return `
      <table>
        <tbody>
          ${this.getHostSelectorTableRow()}
          ${this.#data.map((entry) => this.getTableRowHtml(entry)).join("")}
        </tbody>
      </table>
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
    return this.getTableRowHtml({
      key: "Host Selector",
      value: getHierarchySelector(this.parentElement),
    });
  }
}
