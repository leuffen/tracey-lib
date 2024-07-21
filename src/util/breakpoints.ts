import { TraceyOptions } from "../config/tracey-options";

export class BreakpointDeterminer {
  private readonly orderedBreakpoints: [string, number][] = Object.entries(
    this.options.breakpoints,
  ).sort((a, b) => b[1] - a[1]);

  constructor(private readonly options: TraceyOptions) {}

  getHorizontalBreakpoint(): string {
    return this.getBreakpoint("innerWidth");
  }

  getVerticalBreakpoint(): string {
    return this.getBreakpoint("innerHeight");
  }

  private getBreakpoint(property: "innerWidth" | "innerHeight"): string {
    for (let i = 0; i < this.orderedBreakpoints.length; i++) {
      const [breakpoint, measurement] = this.orderedBreakpoints[i];
      if (window[property] >= measurement) {
        return breakpoint;
      }
    }

    return "unknown";
  }
}
