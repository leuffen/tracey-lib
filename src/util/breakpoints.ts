import { TraceyOptions } from "../config/tracey-options";

export class BreakpointDeterminer {
  private readonly orderedBreakpoints: [string, number][] = Object.entries(
    this.options.breakpoints,
  ).sort((a, b) => b[1] - a[1]);

  constructor(private readonly options: TraceyOptions) {}

  getBreakpoint(): string {
    for (let i = 0; i < this.orderedBreakpoints.length; i++) {
      const [breakpoint, width] = this.orderedBreakpoints[i];
      if (window.innerWidth >= width) {
        return breakpoint;
      }
    }

    return "unknown";
  }
}
