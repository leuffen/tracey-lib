import { ElementStatsVisualizer } from "./element-stats-visualizer";

export class ElementStatsVisualizerStack extends HTMLElement {
  static define(
    tag = "element-stats-visualizer-stack",
    registry = customElements,
  ): string {
    if (!registry.get(tag)) {
      registry.define(tag, this);
    }

    return tag;
  }

  private readonly shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  addVisualizer(visualizer: ElementStatsVisualizer): void {
    this.shadow.querySelector("div > div")!.appendChild(visualizer);
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
          height: 100vh;
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
        
        element-stats-visualizer + element-stats-visualizer {
          margin-top: 8px;
        }
      </style>
      <div>
        <span class="heading">Tracey Analytics</span>
        <div></div>
      </div>
    `;
  }
}
